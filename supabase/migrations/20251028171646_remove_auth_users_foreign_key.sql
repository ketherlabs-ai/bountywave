/*
  # Remove Foreign Key to auth.users

  ## Problem
  - The profiles table has a foreign key constraint to auth.users
  - This prevents creating profiles for wallet-only users (Web3 native)
  - Users must authenticate with Supabase Auth before connecting wallet

  ## Solution
  - Drop the foreign key constraint profiles_id_fkey
  - Allow profiles to exist independently
  - wallet_address becomes the primary identifier instead of auth.users.id

  ## Security
  - RLS policies remain in place
  - wallet_address UNIQUE constraint prevents duplicates
  - Data integrity maintained through application logic

  ## Notes
  - This enables true Web3-native authentication
  - Wallet connection works without email/password
  - Existing profiles linked to auth.users remain functional
*/

-- Drop the foreign key constraint that links profiles to auth.users
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;
