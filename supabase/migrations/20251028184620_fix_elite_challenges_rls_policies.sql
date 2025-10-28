/*
  # Fix Elite Challenges RLS Policies
  
  ## Changes
  This migration fixes the RLS policies for elite challenges tables to work with the wallet-based
  authentication system used by BountyWave, which stores users in the `profiles` table directly
  instead of using Supabase's built-in auth system.
  
  ## Changes Made
  1. Drop existing policies that use `auth.uid()`
  2. Create new policies that allow public access for SELECT operations
  3. Create new policies for INSERT/UPDATE that check against the `profiles` table
  
  ## Security Notes
  - SELECT policies are public to allow anyone to view challenges and participants
  - INSERT policies verify that the user_id exists in the profiles table
  - UPDATE policies verify that the user_id matches a valid profile
*/

-- Drop existing policies for elite_challenges
DROP POLICY IF EXISTS "Anyone can view elite challenges" ON elite_challenges;
DROP POLICY IF EXISTS "Authenticated users can create elite challenges" ON elite_challenges;
DROP POLICY IF EXISTS "Public can view elite challenges" ON elite_challenges;
DROP POLICY IF EXISTS "Users can create elite challenges" ON elite_challenges;

-- Drop existing policies for elite_challenge_participants
DROP POLICY IF EXISTS "Anyone can view participants" ON elite_challenge_participants;
DROP POLICY IF EXISTS "Authenticated users can register for challenges" ON elite_challenge_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON elite_challenge_participants;
DROP POLICY IF EXISTS "Public can view participants" ON elite_challenge_participants;
DROP POLICY IF EXISTS "Users can register for challenges" ON elite_challenge_participants;

-- Drop existing policies for elite_challenge_tech_details
DROP POLICY IF EXISTS "Anyone can view tech details" ON elite_challenge_tech_details;
DROP POLICY IF EXISTS "Public can view tech details" ON elite_challenge_tech_details;
DROP POLICY IF EXISTS "Can insert tech details for challenges" ON elite_challenge_tech_details;

-- Create new public SELECT policies
CREATE POLICY "Public can view elite challenges"
  ON elite_challenges FOR SELECT
  USING (true);

CREATE POLICY "Public can view participants"
  ON elite_challenge_participants FOR SELECT
  USING (true);

CREATE POLICY "Public can view tech details"
  ON elite_challenge_tech_details FOR SELECT
  USING (true);

-- Create INSERT policy for participants (verify user exists in profiles)
CREATE POLICY "Users can register for challenges"
  ON elite_challenge_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = elite_challenge_participants.user_id
    )
  );

-- Create UPDATE policy for participants (verify user exists in profiles)
CREATE POLICY "Users can update their participation"
  ON elite_challenge_participants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = elite_challenge_participants.user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = elite_challenge_participants.user_id
    )
  );

-- Create INSERT policy for elite challenges (verify creator exists in profiles)
CREATE POLICY "Users can create elite challenges"
  ON elite_challenges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = elite_challenges.created_by
    )
  );

-- Create INSERT policy for tech details (allow inserts if challenge exists)
CREATE POLICY "Can insert tech details for challenges"
  ON elite_challenge_tech_details FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM elite_challenges
      WHERE elite_challenges.id = elite_challenge_tech_details.challenge_id
    )
  );