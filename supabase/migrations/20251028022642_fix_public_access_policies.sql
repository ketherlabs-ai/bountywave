/*
  # Fix Public Access to Bounties

  1. Changes
    - Add policies for anonymous (non-authenticated) users to view bounties, categories, and submissions
    - Keep existing authenticated policies
    - Allow public read access to enable browsing without wallet connection

  2. Security
    - Read-only access for anonymous users
    - Write operations still require authentication
*/

-- Drop existing restrictive policies and recreate with public access
DROP POLICY IF EXISTS "Anyone can view active bounties" ON bounties;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view submissions" ON submissions;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view votes" ON votes;
DROP POLICY IF EXISTS "Users can view all achievements" ON achievements;

-- Bounties: Public read access
CREATE POLICY "Public can view bounties"
  ON bounties FOR SELECT
  USING (true);

-- Categories: Public read access
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  USING (true);

-- Submissions: Public read access
CREATE POLICY "Public can view submissions"
  ON submissions FOR SELECT
  USING (true);

-- Profiles: Public read access
CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT
  USING (true);

-- Votes: Public read access
CREATE POLICY "Public can view votes"
  ON votes FOR SELECT
  USING (true);

-- Achievements: Public read access
CREATE POLICY "Public can view achievements"
  ON achievements FOR SELECT
  USING (true);
