/*
  # Fix User Registration Policies

  ## Changes
  - Add INSERT policy for profiles
  - Add INSERT policies for user_stats
  - Add INSERT policies for user_portfolios
  - Allow any authenticated user to create their own records during registration

  ## Security
  - Users can only create records for themselves
  - Prevents unauthorized creation of records for other users
*/

-- Allow users to create their own profile during registration
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to create their own user_stats during registration
DROP POLICY IF EXISTS "Users can create own stats" ON user_stats;
CREATE POLICY "Users can create own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

-- Allow users to create their own portfolio during registration
DROP POLICY IF EXISTS "Users can create own portfolio" ON user_portfolios;
CREATE POLICY "Users can create own portfolio"
  ON user_portfolios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);
