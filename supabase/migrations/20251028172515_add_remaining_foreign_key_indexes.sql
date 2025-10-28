/*
  # Add Remaining Foreign Key Indexes

  ## Problem
  - 6 foreign key columns still lack indexes
  - Causes slow JOIN operations
  
  ## Solution
  - Create indexes on remaining foreign key columns
  - Improves query performance for related data lookups
*/

CREATE INDEX IF NOT EXISTS idx_bounty_milestones_bounty_id ON bounty_milestones(bounty_id);
CREATE INDEX IF NOT EXISTS idx_bounty_tags_bounty_id ON bounty_tags(bounty_id);
CREATE INDEX IF NOT EXISTS idx_comments_bounty_id ON comments(bounty_id);
CREATE INDEX IF NOT EXISTS idx_phase_submissions_phase_id ON phase_submissions(phase_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_bounty_id ON team_messages(bounty_id);
CREATE INDEX IF NOT EXISTS idx_transparency_logs_bounty_id ON transparency_logs(bounty_id);
