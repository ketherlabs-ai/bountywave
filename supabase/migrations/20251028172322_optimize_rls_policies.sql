/*
  # Optimize RLS Policies

  ## Problem
  - 28 RLS policies call auth.uid() directly
  - This causes re-evaluation for each row at scale
  - Significantly degrades performance on large datasets
  
  ## Solution
  - Wrap auth.uid() in SELECT statements
  - PostgreSQL evaluates once and reuses the value
  - Improves performance without compromising security
*/

-- profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- bounties
DROP POLICY IF EXISTS "Creators can insert bounties" ON bounties;
CREATE POLICY "Creators can insert bounties"
  ON bounties FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = creator_id);

DROP POLICY IF EXISTS "Creators can update own bounties" ON bounties;
CREATE POLICY "Creators can update own bounties"
  ON bounties FOR UPDATE TO authenticated
  USING ((select auth.uid()) = creator_id)
  WITH CHECK ((select auth.uid()) = creator_id);

-- submissions
DROP POLICY IF EXISTS "Users can insert submissions" ON submissions;
CREATE POLICY "Users can insert submissions"
  ON submissions FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = submitter_id);

DROP POLICY IF EXISTS "Submitters can update own submissions" ON submissions;
CREATE POLICY "Submitters can update own submissions"
  ON submissions FOR UPDATE TO authenticated
  USING ((select auth.uid()) = submitter_id)
  WITH CHECK ((select auth.uid()) = submitter_id);

-- votes
DROP POLICY IF EXISTS "Users can insert votes" ON votes;
CREATE POLICY "Users can insert votes"
  ON votes FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = voter_id);

-- transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT TO authenticated
  USING ((select auth.uid()) = from_profile_id OR (select auth.uid()) = to_profile_id);

-- comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- team_messages
DROP POLICY IF EXISTS "Team members can view messages" ON team_messages;
CREATE POLICY "Team members can view messages"
  ON team_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.bounty_id = team_messages.bounty_id
      AND team_members.profile_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Team members can send messages" ON team_messages;
CREATE POLICY "Team members can send messages"
  ON team_messages FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = sender_id
    AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.bounty_id = team_messages.bounty_id
      AND team_members.profile_id = (select auth.uid())
    )
  );

-- user_portfolios
DROP POLICY IF EXISTS "Users can manage own portfolio" ON user_portfolios;
CREATE POLICY "Users can manage own portfolio"
  ON user_portfolios FOR ALL TO authenticated
  USING ((select auth.uid()) = profile_id)
  WITH CHECK ((select auth.uid()) = profile_id);

-- user_endorsements
DROP POLICY IF EXISTS "Users can endorse others" ON user_endorsements;
CREATE POLICY "Users can endorse others"
  ON user_endorsements FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = endorser_id);

-- community_votes
DROP POLICY IF EXISTS "Users can cast community votes" ON community_votes;
CREATE POLICY "Users can cast community votes"
  ON community_votes FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = voter_id);

-- bounty_proposals
DROP POLICY IF EXISTS "Users can create bounty proposals" ON bounty_proposals;
CREATE POLICY "Users can create bounty proposals"
  ON bounty_proposals FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = proposer_id);

-- proposal_votes
DROP POLICY IF EXISTS "Users can vote on bounty proposals" ON proposal_votes;
CREATE POLICY "Users can vote on bounty proposals"
  ON proposal_votes FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = voter_id);

-- user_stats
DROP POLICY IF EXISTS "Users can create own stats" ON user_stats;
CREATE POLICY "Users can create own stats"
  ON user_stats FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = profile_id);

-- bounty_phases
DROP POLICY IF EXISTS "Creators can manage their bounty phases" ON bounty_phases;
CREATE POLICY "Creators can manage their bounty phases"
  ON bounty_phases FOR ALL TO authenticated
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

-- phase_submissions
DROP POLICY IF EXISTS "Users can create phase submissions" ON phase_submissions;
CREATE POLICY "Users can create phase submissions"
  ON phase_submissions FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = submitter_id);

DROP POLICY IF EXISTS "Users can update own submissions" ON phase_submissions;
CREATE POLICY "Users can update own submissions"
  ON phase_submissions FOR UPDATE TO authenticated
  USING ((select auth.uid()) = submitter_id)
  WITH CHECK ((select auth.uid()) = submitter_id);

-- bounty_collaborators
DROP POLICY IF EXISTS "Creators can add collaborators" ON bounty_collaborators;
CREATE POLICY "Creators can add collaborators"
  ON bounty_collaborators FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bounties
      WHERE bounties.id = bounty_collaborators.bounty_id
      AND bounties.creator_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Collaborators can leave" ON bounty_collaborators;
CREATE POLICY "Collaborators can leave"
  ON bounty_collaborators FOR DELETE TO authenticated
  USING ((select auth.uid()) = collaborator_id);
