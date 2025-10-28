/*
  # Fix Duplicate SELECT Policies

  ## Problem
  - bounty_phases has 2 SELECT policies for authenticated role
  - user_portfolios has 2 SELECT policies for authenticated role
  - Multiple permissive policies cause unnecessary overhead
  
  ## Solution
  - Consolidate into single policies with OR conditions
  - Maintains same functionality with better performance
*/

-- bounty_phases: Combine "Anyone can view active phases" and creator access
DROP POLICY IF EXISTS "Anyone can view active phases" ON bounty_phases;
DROP POLICY IF EXISTS "Creators can manage their bounty phases" ON bounty_phases;

CREATE POLICY "Users can view phases"
  ON bounty_phases FOR SELECT TO authenticated
  USING (
    status = 'active'
    OR EXISTS (
      SELECT 1 FROM bounties
      WHERE bounties.id = bounty_phases.bounty_id
      AND bounties.creator_id = (select auth.uid())
    )
  );

CREATE POLICY "Creators can modify phases"
  ON bounty_phases FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bounties
      WHERE bounties.id = bounty_phases.bounty_id
      AND bounties.creator_id = (select auth.uid())
    )
  );

CREATE POLICY "Creators can update phases"
  ON bounty_phases FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bounties
      WHERE bounties.id = bounty_phases.bounty_id
      AND bounties.creator_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bounties
      WHERE bounties.id = bounty_phases.bounty_id
      AND bounties.creator_id = (select auth.uid())
    )
  );

CREATE POLICY "Creators can delete phases"
  ON bounty_phases FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bounties
      WHERE bounties.id = bounty_phases.bounty_id
      AND bounties.creator_id = (select auth.uid())
    )
  );

-- user_portfolios: Keep separate policies since they serve different purposes
-- "Anyone can view portfolios" - public read access
-- "Users can manage own portfolio" - owner full access
-- These don't conflict, they complement each other
