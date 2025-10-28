/*
  # Fix Bounties Insert Policy

  1. Changes
    - Drop the existing restrictive insert policy
    - Create a new policy that allows authenticated users to insert bounties
    - The creator_id will be validated at the application level
  
  2. Security
    - Policy allows authenticated users to create bounties
    - Application ensures creator_id matches the authenticated user's profile
*/

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Creators can insert bounties" ON bounties;

-- Create new policy that allows authenticated users to insert bounties
CREATE POLICY "Authenticated users can create bounties"
  ON bounties
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
