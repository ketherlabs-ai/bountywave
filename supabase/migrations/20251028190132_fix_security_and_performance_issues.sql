/*
  # Fix Security and Performance Issues

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  Creates indexes on all foreign key columns to improve query performance:
  - achievements table: bounty_id
  - ai_challenge_suggestions table: created_bounty_id
  - ai_generations table: user_id
  - bounties table: creator_id
  - bounty_phases table: winner_id
  - bounty_proposals table: category_id, proposer_id
  - comments table: parent_id
  - community_votes table: delegated_from, voter_id
  - elite_challenges table: created_by
  - lottery_entries table: user_id
  - lottery_winners table: round_id, winner_id
  - proposal_votes table: voter_id
  - stream_chat table: user_id
  - stream_sessions table: bounty_id, host_id
  - submissions table: submitter_id
  - success_predictions table: bounty_id, user_id
  - team_members table: profile_id
  - team_messages table: parent_id, sender_id
  - transactions table: bounty_id, to_profile_id
  - transparency_logs table: from_profile, to_profile
  - user_achievements table: achievement_id
  - user_endorsements table: bounty_id, endorser_id
  - votes table: voter_id

  ### 2. Drop Unused Indexes
  Removes indexes that are not being utilized by queries

  ### 3. Fix Auth RLS Performance
  Optimizes RLS policies by using subqueries for auth functions

  ### 4. Remove Duplicate Permissive Policies
  Consolidates multiple permissive policies into single efficient policies

  ### 5. Fix Function Search Paths
  Secures functions by setting proper search paths
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- achievements
CREATE INDEX IF NOT EXISTS idx_achievements_bounty_id ON public.achievements(bounty_id);

-- ai_challenge_suggestions
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_created_bounty ON public.ai_challenge_suggestions(created_bounty_id);

-- ai_generations
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON public.ai_generations(user_id);

-- bounties
CREATE INDEX IF NOT EXISTS idx_bounties_creator_id ON public.bounties(creator_id);

-- bounty_phases
CREATE INDEX IF NOT EXISTS idx_bounty_phases_winner_id ON public.bounty_phases(winner_id);

-- bounty_proposals
CREATE INDEX IF NOT EXISTS idx_bounty_proposals_category_id ON public.bounty_proposals(category_id);
CREATE INDEX IF NOT EXISTS idx_bounty_proposals_proposer_id ON public.bounty_proposals(proposer_id);

-- comments
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- community_votes
CREATE INDEX IF NOT EXISTS idx_community_votes_delegated_from ON public.community_votes(delegated_from);
CREATE INDEX IF NOT EXISTS idx_community_votes_voter_id ON public.community_votes(voter_id);

-- elite_challenges
CREATE INDEX IF NOT EXISTS idx_elite_challenges_created_by ON public.elite_challenges(created_by);

-- lottery_entries
CREATE INDEX IF NOT EXISTS idx_lottery_entries_user_id ON public.lottery_entries(user_id);

-- lottery_winners
CREATE INDEX IF NOT EXISTS idx_lottery_winners_round_id ON public.lottery_winners(round_id);
CREATE INDEX IF NOT EXISTS idx_lottery_winners_winner_id ON public.lottery_winners(winner_id);

-- proposal_votes
CREATE INDEX IF NOT EXISTS idx_proposal_votes_voter_id ON public.proposal_votes(voter_id);

-- stream_chat
CREATE INDEX IF NOT EXISTS idx_stream_chat_user_id ON public.stream_chat(user_id);

-- stream_sessions
CREATE INDEX IF NOT EXISTS idx_stream_sessions_bounty_id ON public.stream_sessions(bounty_id);
CREATE INDEX IF NOT EXISTS idx_stream_sessions_host_id ON public.stream_sessions(host_id);

-- submissions
CREATE INDEX IF NOT EXISTS idx_submissions_submitter_id ON public.submissions(submitter_id);

-- success_predictions
CREATE INDEX IF NOT EXISTS idx_success_predictions_bounty_id ON public.success_predictions(bounty_id);
CREATE INDEX IF NOT EXISTS idx_success_predictions_user_id ON public.success_predictions(user_id);

-- team_members
CREATE INDEX IF NOT EXISTS idx_team_members_profile_id ON public.team_members(profile_id);

-- team_messages
CREATE INDEX IF NOT EXISTS idx_team_messages_parent_id ON public.team_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_sender_id ON public.team_messages(sender_id);

-- transactions
CREATE INDEX IF NOT EXISTS idx_transactions_bounty_id ON public.transactions(bounty_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_profile_id ON public.transactions(to_profile_id);

-- transparency_logs
CREATE INDEX IF NOT EXISTS idx_transparency_logs_from_profile ON public.transparency_logs(from_profile);
CREATE INDEX IF NOT EXISTS idx_transparency_logs_to_profile ON public.transparency_logs(to_profile);

-- user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- user_endorsements
CREATE INDEX IF NOT EXISTS idx_user_endorsements_bounty_id ON public.user_endorsements(bounty_id);
CREATE INDEX IF NOT EXISTS idx_user_endorsements_endorser_id ON public.user_endorsements(endorser_id);

-- votes
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON public.votes(voter_id);

-- =====================================================
-- 2. DROP UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS public.idx_ar_interactions_bounty;
DROP INDEX IF EXISTS public.idx_ar_interactions_user;
DROP INDEX IF EXISTS public.idx_nft_evolution_nft;
DROP INDEX IF EXISTS public.idx_stream_chat_session;
DROP INDEX IF EXISTS public.idx_ai_suggestions_profile;
DROP INDEX IF EXISTS public.idx_bounty_unlocks_bounty;
DROP INDEX IF EXISTS public.idx_bounty_unlocks_user;
DROP INDEX IF EXISTS public.idx_payment_streams_recipient;
DROP INDEX IF EXISTS public.idx_payment_streams_bounty;
DROP INDEX IF EXISTS public.idx_heatmap_user_date;
DROP INDEX IF EXISTS public.idx_elite_challenges_deadline;
DROP INDEX IF EXISTS public.idx_elite_challenge_participants_challenge;
DROP INDEX IF EXISTS public.idx_elite_challenge_participants_user;
DROP INDEX IF EXISTS public.idx_bounty_milestones_bounty_id;
DROP INDEX IF EXISTS public.idx_bounty_tags_bounty_id;
DROP INDEX IF EXISTS public.idx_comments_bounty_id;
DROP INDEX IF EXISTS public.idx_phase_submissions_phase_id;
DROP INDEX IF EXISTS public.idx_team_messages_bounty_id;
DROP INDEX IF EXISTS public.idx_transparency_logs_bounty_id;

-- =====================================================
-- 3. FIX AUTH RLS PERFORMANCE ISSUES
-- =====================================================

-- Fix elite_challenges policy
DROP POLICY IF EXISTS "Creator can update their elite challenges" ON public.elite_challenges;
CREATE POLICY "Creator can update their elite challenges"
  ON public.elite_challenges
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = created_by)
  WITH CHECK ((select auth.uid()) = created_by);

-- Fix elite_challenge_tech_details policy
DROP POLICY IF EXISTS "Challenge creator can add tech details" ON public.elite_challenge_tech_details;
CREATE POLICY "Challenge creator can add tech details"
  ON public.elite_challenge_tech_details
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.elite_challenges
      WHERE id = challenge_id
      AND created_by = (select auth.uid())
    )
  );

-- =====================================================
-- 4. REMOVE DUPLICATE PERMISSIVE POLICIES
-- =====================================================

-- ai_challenge_suggestions: Keep only the broader policy
DROP POLICY IF EXISTS "Users can view own AI suggestions" ON public.ai_challenge_suggestions;

-- dynamic_nfts: Keep only the broader policy
DROP POLICY IF EXISTS "Users can manage own NFT" ON public.dynamic_nfts;

-- elite_challenge_tech_details: Remove duplicate anon policy
DROP POLICY IF EXISTS "Anyone can view tech details (anon)" ON public.elite_challenge_tech_details;

-- elite_challenge_tech_details: Remove duplicate insert policy
DROP POLICY IF EXISTS "Can insert tech details for challenges" ON public.elite_challenge_tech_details;

-- elite_challenges: Remove duplicate anon policy
DROP POLICY IF EXISTS "Anyone can view elite challenges (anon)" ON public.elite_challenges;

-- lottery_entries: Keep only the broader policy
DROP POLICY IF EXISTS "Users can view own lottery entries" ON public.lottery_entries;

-- payment_streams: Keep only the broader policy
DROP POLICY IF EXISTS "Users can view own payment streams" ON public.payment_streams;

-- stream_sessions: Keep only the broader policy
DROP POLICY IF EXISTS "Hosts can manage streams" ON public.stream_sessions;

-- user_activity_heatmap: Keep only the broader policy
DROP POLICY IF EXISTS "Users can view own heatmap" ON public.user_activity_heatmap;

-- user_portfolios: Keep only the broader policy
DROP POLICY IF EXISTS "Users can manage own portfolio" ON public.user_portfolios;

-- user_streaks: Keep only the broader policy
DROP POLICY IF EXISTS "Users can view own streaks" ON public.user_streaks;

-- =====================================================
-- 5. FIX FUNCTION SEARCH PATHS
-- =====================================================

-- Fix increment_participant_count
CREATE OR REPLACE FUNCTION public.increment_participant_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.elite_challenges
  SET participants_count = participants_count + 1
  WHERE id = NEW.challenge_id;
  RETURN NEW;
END;
$$;

-- Fix increment_submission_count
CREATE OR REPLACE FUNCTION public.increment_submission_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bounties
  SET submission_count = submission_count + 1
  WHERE id = NEW.bounty_id;
  RETURN NEW;
END;
$$;
