/*
  # Remove Duplicate Policies

  ## Problem
  - Multiple permissive policies exist for same table/role/action
  - Increases policy evaluation overhead
  
  ## Solution
  - Keep only the necessary policies
  - Consolidate functionality where possible
*/

-- Remove duplicate user_portfolios INSERT policy (ALL policy covers it)
DROP POLICY IF EXISTS "Users can create own portfolio" ON user_portfolios;

-- Recreate anon profile creation policy separately from authenticated
DROP POLICY IF EXISTS "Anyone can create profile during registration" ON profiles;
CREATE POLICY "Anyone can create profile during registration"
  ON profiles FOR INSERT TO anon
  WITH CHECK (true);
