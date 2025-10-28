/*
  # Drop Unused Indexes

  ## Problem
  - 20 indexes exist but are never used by queries
  - Waste storage space and slow down writes
  
  ## Solution
  - Drop unused indexes to improve performance
  - Reduces storage overhead
*/

DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_read;
DROP INDEX IF EXISTS idx_bounty_phases_bounty;
DROP INDEX IF EXISTS idx_bounty_phases_status;
DROP INDEX IF EXISTS idx_phase_submissions_phase;
DROP INDEX IF EXISTS idx_bounty_collaborators_bounty;
DROP INDEX IF EXISTS idx_bounties_sponsored;
DROP INDEX IF EXISTS idx_bounties_contract_address;
DROP INDEX IF EXISTS idx_bounties_contract_deployed;
DROP INDEX IF EXISTS idx_bounties_deadline;
DROP INDEX IF EXISTS idx_votes_submission;
DROP INDEX IF EXISTS idx_comments_bounty_id;
DROP INDEX IF EXISTS idx_bounty_tags_bounty_id;
DROP INDEX IF EXISTS idx_bounty_milestones_bounty;
DROP INDEX IF EXISTS idx_team_members_bounty;
DROP INDEX IF EXISTS idx_user_stats_ranking;
DROP INDEX IF EXISTS idx_team_messages_bounty;
DROP INDEX IF EXISTS idx_community_votes_submission;
DROP INDEX IF EXISTS idx_bounty_proposals_status;
DROP INDEX IF EXISTS idx_transparency_logs_bounty;
