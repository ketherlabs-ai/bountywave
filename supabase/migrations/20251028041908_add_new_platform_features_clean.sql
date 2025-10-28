/*
  # New Platform Features for BountyWave

  ## Tables to Create
  
  1. **user_stats** - User statistics and rankings
  2. **achievement_types** - Achievement definitions
  3. **team_bounties** - Team collaboration
  4. **team_members** - Team membership
  5. **team_messages** - Team communication
  6. **bounty_milestones** - Staged rewards
  7. **user_portfolios** - Talent marketplace
  8. **user_endorsements** - Peer recommendations
  9. **community_votes** - DAO voting
  10. **bounty_proposals** - Community suggestions
  11. **proposal_votes** - Proposal voting
  12. **transparency_logs** - Public audit trail
  
  ## Security
  - RLS enabled on all tables
*/

-- User Statistics
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_bounties_created int DEFAULT 0,
  total_bounties_participated int DEFAULT 0,
  total_bounties_won int DEFAULT 0,
  total_rewards_earned decimal(20, 8) DEFAULT 0,
  ranking_score int DEFAULT 0,
  achievements_count int DEFAULT 0,
  endorsements_count int DEFAULT 0,
  vote_weight decimal(10, 2) DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (true);

-- Achievement Types (catalog)
CREATE TABLE IF NOT EXISTS achievement_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  criteria jsonb NOT NULL,
  rarity text CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  points int DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievement_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievement types"
  ON achievement_types FOR SELECT
  TO authenticated
  USING (true);

-- Enhance transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'scrollscan_url'
  ) THEN
    ALTER TABLE transactions ADD COLUMN scrollscan_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'transaction_type'
  ) THEN
    ALTER TABLE transactions ADD COLUMN transaction_type text;
  END IF;
END $$;

-- Team Bounties
CREATE TABLE IF NOT EXISTS team_bounties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE UNIQUE NOT NULL,
  max_members int DEFAULT 5,
  min_members int DEFAULT 2,
  requires_team_submission boolean DEFAULT true,
  allow_join_requests boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_bounties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team bounties"
  ON team_bounties FOR SELECT
  TO authenticated
  USING (true);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('leader', 'member', 'contributor')) DEFAULT 'member',
  contribution_percentage decimal(5, 2) DEFAULT 0,
  status text CHECK (status IN ('active', 'invited', 'left')) DEFAULT 'active',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(bounty_id, profile_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

-- Team Messages
CREATE TABLE IF NOT EXISTS team_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  parent_id uuid REFERENCES team_messages(id) ON DELETE CASCADE,
  is_announcement boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view messages"
  ON team_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.bounty_id = team_messages.bounty_id
      AND team_members.profile_id = auth.uid()
    )
  );

CREATE POLICY "Team members can send messages"
  ON team_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.bounty_id = bounty_id
      AND team_members.profile_id = auth.uid()
    )
  );

-- Bounty Milestones
CREATE TABLE IF NOT EXISTS bounty_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  reward_percentage decimal(5, 2) NOT NULL,
  order_index int NOT NULL,
  status text CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')) DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bounty_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view milestones"
  ON bounty_milestones FOR SELECT
  TO authenticated
  USING (true);

-- User Portfolios
CREATE TABLE IF NOT EXISTS user_portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  bio text,
  skills text[] DEFAULT ARRAY[]::text[],
  expertise_level text CHECK (expertise_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
  hourly_rate decimal(10, 2),
  availability text CHECK (availability IN ('available', 'busy', 'unavailable')) DEFAULT 'available',
  portfolio_url text,
  github_url text,
  twitter_url text,
  website_url text,
  total_earnings decimal(20, 8) DEFAULT 0,
  success_rate decimal(5, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view portfolios"
  ON user_portfolios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own portfolio"
  ON user_portfolios FOR ALL
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- User Endorsements
CREATE TABLE IF NOT EXISTS user_endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endorsed_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  endorser_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill text NOT NULL,
  rating int CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment text,
  bounty_id uuid REFERENCES bounties(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(endorsed_profile_id, endorser_id, skill)
);

ALTER TABLE user_endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view endorsements"
  ON user_endorsements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can endorse others"
  ON user_endorsements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = endorser_id AND auth.uid() != endorsed_profile_id);

-- Community Votes
CREATE TABLE IF NOT EXISTS community_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
  voter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vote_weight decimal(10, 2) DEFAULT 1.0,
  reason text,
  is_delegated boolean DEFAULT false,
  delegated_from uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(submission_id, voter_id)
);

ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community votes"
  ON community_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can cast community votes"
  ON community_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = voter_id);

-- Bounty Proposals
CREATE TABLE IF NOT EXISTS bounty_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  proposed_reward decimal(20, 8) NOT NULL,
  reward_token text DEFAULT 'ETH',
  votes_for int DEFAULT 0,
  votes_against int DEFAULT 0,
  status text CHECK (status IN ('proposed', 'voting', 'approved', 'rejected', 'created')) DEFAULT 'proposed',
  voting_ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bounty_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bounty proposals"
  ON bounty_proposals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create bounty proposals"
  ON bounty_proposals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = proposer_id);

-- Proposal Votes
CREATE TABLE IF NOT EXISTS proposal_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES bounty_proposals(id) ON DELETE CASCADE NOT NULL,
  voter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vote boolean NOT NULL,
  vote_weight decimal(10, 2) DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(proposal_id, voter_id)
);

ALTER TABLE proposal_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proposal votes"
  ON proposal_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote on bounty proposals"
  ON proposal_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = voter_id);

-- Transparency Logs
CREATE TABLE IF NOT EXISTS transparency_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  amount decimal(20, 8),
  token text,
  from_profile uuid REFERENCES profiles(id) ON DELETE SET NULL,
  to_profile uuid REFERENCES profiles(id) ON DELETE SET NULL,
  tx_hash text,
  scrollscan_url text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transparency_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view transparency logs"
  ON transparency_logs FOR SELECT
  TO authenticated
  USING (true);

-- Insert default achievement types
INSERT INTO achievement_types (name, description, icon, criteria, rarity, points) VALUES
  ('First Bounty', 'Complete your first bounty', '🎯', '{"type": "bounties_completed", "count": 1}', 'common', 10),
  ('Early Adopter', 'Join BountyWave in the first month', '🚀', '{"type": "join_date", "before": "2025-11-28"}', 'rare', 25),
  ('Team Player', 'Participate in 5 team bounties', '🤝', '{"type": "team_bounties", "count": 5}', 'common', 15),
  ('Big Winner', 'Win a bounty worth 1+ ETH', '💎', '{"type": "single_reward", "amount": 1}', 'epic', 50),
  ('Consistent', 'Complete 10 bounties', '⭐', '{"type": "bounties_completed", "count": 10}', 'rare', 30),
  ('Legendary', 'Complete 50 bounties', '👑', '{"type": "bounties_completed", "count": 50}', 'legendary', 100),
  ('Community Leader', 'Get 25 endorsements', '🌟', '{"type": "endorsements", "count": 25}', 'epic', 75),
  ('Sponsor', 'Create and fund a bounty', '💰', '{"type": "bounties_created", "count": 1}', 'common', 20)
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_profile ON user_stats(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_ranking ON user_stats(ranking_score DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_bounty ON team_members(bounty_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_bounty ON team_messages(bounty_id);
CREATE INDEX IF NOT EXISTS idx_bounty_milestones_bounty ON bounty_milestones(bounty_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_profile ON user_portfolios(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_endorsements_endorsed ON user_endorsements(endorsed_profile_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_submission ON community_votes(submission_id);
CREATE INDEX IF NOT EXISTS idx_bounty_proposals_status ON bounty_proposals(status);
CREATE INDEX IF NOT EXISTS idx_transparency_logs_bounty ON transparency_logs(bounty_id);
