/*
  # Add Advanced Platform Features

  1. New Tables
    - `comments`: Comments and feedback on bounties
    - `bounty_tags`: Tags for better filtering
    - `user_achievements`: Track user achievements and badges
    - `leaderboard`: Materialized view for rankings

  2. New Columns
    - `bounties.difficulty_level`: Track difficulty (beginner, intermediate, advanced, expert)
    - `bounties.is_collaborative`: Support team/collaborative bounties
    - `bounties.max_team_size`: Max team size for collaborative bounties
    - `bounties.is_sponsored`: Mark sponsored/premium bounties
    - `bounties.sponsor_name`: Name of sponsor
    - `profiles.experience_points`: XP for gamification
    - `profiles.level`: User level based on XP
    - `profiles.badges`: Array of earned badge IDs

  3. Security
    - Enable RLS on all new tables
    - Public read access for rankings and achievements
    - Authenticated write access for comments
*/

-- Add new columns to bounties table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bounties' AND column_name = 'difficulty_level') THEN
    ALTER TABLE bounties ADD COLUMN difficulty_level text DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bounties' AND column_name = 'is_collaborative') THEN
    ALTER TABLE bounties ADD COLUMN is_collaborative boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bounties' AND column_name = 'max_team_size') THEN
    ALTER TABLE bounties ADD COLUMN max_team_size integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bounties' AND column_name = 'is_sponsored') THEN
    ALTER TABLE bounties ADD COLUMN is_sponsored boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bounties' AND column_name = 'sponsor_name') THEN
    ALTER TABLE bounties ADD COLUMN sponsor_name text;
  END IF;
END $$;

-- Add gamification columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'experience_points') THEN
    ALTER TABLE profiles ADD COLUMN experience_points integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'level') THEN
    ALTER TABLE profiles ADD COLUMN level integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'badges') THEN
    ALTER TABLE profiles ADD COLUMN badges text[] DEFAULT '{}';
  END IF;
END $$;

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create bounty_tags table
CREATE TABLE IF NOT EXISTS bounty_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bounty_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view tags"
  ON bounty_tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON bounty_tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view user achievements"
  ON user_achievements FOR SELECT
  USING (true);

CREATE POLICY "System can award achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_bounty_id ON comments(bounty_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_bounty_tags_bounty_id ON bounty_tags(bounty_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_bounties_difficulty ON bounties(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_bounties_sponsored ON bounties(is_sponsored) WHERE is_sponsored = true;
CREATE INDEX IF NOT EXISTS idx_profiles_experience ON profiles(experience_points DESC);

-- Update sample bounties with new fields
UPDATE bounties SET difficulty_level = 'advanced', is_collaborative = false WHERE id = 'b0000000-0000-0000-0000-000000000001';
UPDATE bounties SET difficulty_level = 'intermediate', is_collaborative = false WHERE id = 'b0000000-0000-0000-0000-000000000002';
UPDATE bounties SET difficulty_level = 'beginner', is_collaborative = false WHERE id = 'b0000000-0000-0000-0000-000000000003';
UPDATE bounties SET difficulty_level = 'intermediate', is_collaborative = false WHERE id = 'b0000000-0000-0000-0000-000000000004';
UPDATE bounties SET difficulty_level = 'expert', is_collaborative = false WHERE id = 'b0000000-0000-0000-0000-000000000005';
UPDATE bounties SET difficulty_level = 'intermediate', is_collaborative = false WHERE id = 'b0000000-0000-0000-0000-000000000006';
UPDATE bounties SET difficulty_level = 'beginner', is_collaborative = false WHERE id = 'b0000000-0000-0000-0000-000000000007';
UPDATE bounties SET difficulty_level = 'intermediate', is_collaborative = false WHERE id = 'b0000000-0000-0000-0000-000000000008';
UPDATE bounties SET difficulty_level = 'intermediate', is_collaborative = true, max_team_size = 3 WHERE id = 'b0000000-0000-0000-0000-000000000009';
UPDATE bounties SET difficulty_level = 'intermediate', is_collaborative = false WHERE id = 'b0000000-0000-0000-0000-000000000010';

-- Mark some bounties as sponsored
UPDATE bounties SET is_sponsored = true, sponsor_name = 'Scroll Foundation' WHERE id = 'b0000000-0000-0000-0000-000000000005';
UPDATE bounties SET is_sponsored = true, sponsor_name = 'Web3 Builders DAO' WHERE id = 'b0000000-0000-0000-0000-000000000001';
