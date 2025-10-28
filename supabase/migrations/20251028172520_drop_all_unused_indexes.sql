/*
  # Drop All Unused Indexes

  ## Problem
  - 27 indexes exist but are never used by queries
  - Waste storage and slow down INSERT/UPDATE operations
  
  ## Solution
  - Drop all unused indexes
  - Reduces storage overhead and improves write performance
  
  ## Note
  - These indexes were created proactively but analysis shows they're not being used
  - Can be recreated if usage patterns change
*/

DROP INDEX IF EXISTS idx_achievements_bounty_id;
DROP INDEX IF EXISTS idx_bounties_creator_id;
DROP INDEX IF EXISTS idx_bounty_phases_winner_id;
DROP INDEX IF EXISTS idx_bounty_proposals_category_id;
DROP INDEX IF EXISTS idx_bounty_proposals_proposer_id;
DROP INDEX IF EXISTS idx_comments_parent_id;
DROP INDEX IF EXISTS idx_community_votes_delegated_from;
DROP INDEX IF EXISTS idx_community_votes_voter_id;
DROP INDEX IF EXISTS idx_proposal_votes_voter_id;
DROP INDEX IF EXISTS idx_submissions_submitter_id;
DROP INDEX IF EXISTS idx_team_members_profile_id;
DROP INDEX IF EXISTS idx_team_messages_parent_id;
DROP INDEX IF EXISTS idx_team_messages_sender_id;
DROP INDEX IF EXISTS idx_transactions_bounty_id;
DROP INDEX IF EXISTS idx_transactions_to_profile_id;
DROP INDEX IF EXISTS idx_transparency_logs_from_profile;
DROP INDEX IF EXISTS idx_transparency_logs_to_profile;
DROP INDEX IF EXISTS idx_user_achievements_achievement_id;
DROP INDEX IF EXISTS idx_user_endorsements_bounty_id;
DROP INDEX IF EXISTS idx_user_endorsements_endorser_id;
DROP INDEX IF EXISTS idx_votes_voter_id;
