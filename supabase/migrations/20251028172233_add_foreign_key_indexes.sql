/*
  # Add Missing Foreign Key Indexes

  ## Problem
  - 21 foreign key columns lack indexes
  - Causes slow JOIN operations and full table scans
  
  ## Solution
  - Create index on each foreign key column
  - Dramatically improves query performance
*/

CREATE INDEX IF NOT EXISTS idx_achievements_bounty_id ON achievements(bounty_id);
CREATE INDEX IF NOT EXISTS idx_bounties_creator_id ON bounties(creator_id);
CREATE INDEX IF NOT EXISTS idx_bounty_phases_winner_id ON bounty_phases(winner_id);
CREATE INDEX IF NOT EXISTS idx_bounty_proposals_category_id ON bounty_proposals(category_id);
CREATE INDEX IF NOT EXISTS idx_bounty_proposals_proposer_id ON bounty_proposals(proposer_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_delegated_from ON community_votes(delegated_from);
CREATE INDEX IF NOT EXISTS idx_community_votes_voter_id ON community_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_proposal_votes_voter_id ON proposal_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitter_id ON submissions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_team_members_profile_id ON team_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_parent_id ON team_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_sender_id ON team_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_bounty_id ON transactions(bounty_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_profile_id ON transactions(to_profile_id);
CREATE INDEX IF NOT EXISTS idx_transparency_logs_from_profile ON transparency_logs(from_profile);
CREATE INDEX IF NOT EXISTS idx_transparency_logs_to_profile ON transparency_logs(to_profile);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_endorsements_bounty_id ON user_endorsements(bounty_id);
CREATE INDEX IF NOT EXISTS idx_user_endorsements_endorser_id ON user_endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
