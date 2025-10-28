/*
  # BountyWave Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `wallet_address` (text, unique)
      - `username` (text)
      - `avatar_url` (text)
      - `reputation_score` (integer, default 0)
      - `total_earned` (numeric, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `icon` (text)
      - `created_at` (timestamptz)
    
    - `bounties`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `category_id` (uuid, references categories)
      - `reward_amount` (numeric)
      - `reward_token` (text, default 'USDC')
      - `status` (text: active, evaluating, completed, cancelled)
      - `is_featured` (boolean, default false)
      - `deadline` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `submissions`
      - `id` (uuid, primary key)
      - `bounty_id` (uuid, references bounties)
      - `submitter_id` (uuid, references profiles)
      - `content` (text)
      - `attachments` (jsonb)
      - `status` (text: pending, selected, rejected)
      - `vote_count` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `votes`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, references submissions)
      - `voter_id` (uuid, references profiles)
      - `vote_proof` (text) -- zk-proof hash
      - `created_at` (timestamptz)
    
    - `achievements`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `type` (text: winner, contributor, voter, sponsor)
      - `bounty_id` (uuid, references bounties)
      - `metadata` (jsonb)
      - `nft_token_id` (text)
      - `created_at` (timestamptz)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `from_profile_id` (uuid, references profiles)
      - `to_profile_id` (uuid, references profiles)
      - `bounty_id` (uuid, references bounties)
      - `amount` (numeric)
      - `token` (text)
      - `tx_hash` (text)
      - `status` (text: pending, completed, failed)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Policies for read/write based on ownership and roles
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text UNIQUE,
  username text,
  avatar_url text,
  reputation_score integer DEFAULT 0,
  total_earned numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Insert default categories
INSERT INTO categories (name, slug, icon) VALUES
  ('Tecnología y Desarrollo', 'tech', 'Code'),
  ('Comunidad e Impacto Social', 'community', 'Users'),
  ('Creatividad y Marketing', 'creative', 'Palette'),
  ('Negocios y Procesos', 'business', 'Briefcase'),
  ('Educación y Formación', 'education', 'GraduationCap'),
  ('Ciencia y Datos', 'science', 'FlaskConical')
ON CONFLICT (slug) DO NOTHING;

-- Create bounties table
CREATE TABLE IF NOT EXISTS bounties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id),
  reward_amount numeric NOT NULL CHECK (reward_amount > 0),
  reward_token text DEFAULT 'USDC',
  status text DEFAULT 'active' CHECK (status IN ('active', 'evaluating', 'completed', 'cancelled')),
  is_featured boolean DEFAULT false,
  deadline timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active bounties"
  ON bounties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators can insert bounties"
  ON bounties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own bounties"
  ON bounties FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE,
  submitter_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected')),
  vote_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Submitters can update own submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = submitter_id)
  WITH CHECK (auth.uid() = submitter_id);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE,
  voter_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  vote_proof text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(submission_id, voter_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = voter_id);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('winner', 'contributor', 'voter', 'sponsor')),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}'::jsonb,
  nft_token_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  to_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  bounty_id uuid REFERENCES bounties(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  token text DEFAULT 'USDC',
  tx_hash text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = from_profile_id OR auth.uid() = to_profile_id);

CREATE POLICY "System can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bounties_status ON bounties(status);
CREATE INDEX IF NOT EXISTS idx_bounties_deadline ON bounties(deadline);
CREATE INDEX IF NOT EXISTS idx_bounties_category ON bounties(category_id);
CREATE INDEX IF NOT EXISTS idx_submissions_bounty ON submissions(bounty_id);
CREATE INDEX IF NOT EXISTS idx_votes_submission ON votes(submission_id);
CREATE INDEX IF NOT EXISTS idx_achievements_profile ON achievements(profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_profiles ON transactions(from_profile_id, to_profile_id);