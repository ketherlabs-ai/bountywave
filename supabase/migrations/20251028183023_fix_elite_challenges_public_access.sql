/*
  # Fix Elite Challenges Public Access

  1. Changes
    - Add SELECT policy for anonymous users to view elite challenges
    - Add SELECT policy for elite_challenge_tech_details for anonymous users
    - Elite challenges should be publicly viewable even without authentication

  2. Security
    - Only SELECT is allowed for anonymous users
    - INSERT/UPDATE/DELETE still require authentication
*/

-- Allow anonymous users to view elite challenges
CREATE POLICY "Anyone can view elite challenges (anon)"
  ON elite_challenges
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to view tech details
CREATE POLICY "Anyone can view tech details (anon)"
  ON elite_challenge_tech_details
  FOR SELECT
  TO anon
  USING (true);
