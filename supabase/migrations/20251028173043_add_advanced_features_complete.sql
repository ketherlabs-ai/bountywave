/*
  # Add Advanced Features for MVP

  ## New Features
  
  ### 1. AR/VR Challenges
  - Support for augmented/virtual reality bounties
  - QR code scanning integration
  - 3D model support
  
  ### 2. Dynamic NFT Reputation
  - NFT metadata that updates based on achievements
  - Visual evolution system
  - On-chain reputation tracking
  
  ### 3. Live Streaming Challenges
  - Real-time collaboration support
  - Video/audio streaming metadata
  - Live voting and spectator mode
  
  ### 4. AI Integration
  - AI-generated challenge proposals
  - Content generation history
  - AI assistant interactions
  
  ### 5. Geolocation Bounties
  - Location-based challenge unlocking
  - Proximity detection
  - City-wide treasure hunts
  
  ### 6. Instant Payouts
  - Streaming payment support
  - Real-time fund flow tracking
  - Multi-token support
  
  ### 7. Voter Rewards & Lottery
  - Weekly lottery system
  - Voter participation tracking
  - Automated reward distribution
  
  ### 8. Gamified Analytics
  - Activity heatmaps
  - Streak tracking
  - AI-powered success predictions
  - Real-time dashboard data

  ## Security
  - All tables have RLS enabled
  - Proper indexes for performance
  - Secure data access patterns
*/

-- ============================================================================
-- AR/VR CHALLENGES
-- ============================================================================

ALTER TABLE bounties ADD COLUMN IF NOT EXISTS is_ar_vr boolean DEFAULT false;
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS ar_vr_type text CHECK (ar_vr_type IN ('ar', 'vr', 'mixed'));
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS qr_code_data text;
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS model_3d_url text;
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS ar_instructions jsonb;

CREATE TABLE IF NOT EXISTS ar_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  interaction_type text NOT NULL,
  location_data jsonb,
  scan_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ar_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record AR interactions"
  ON ar_interactions FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own AR interactions"
  ON ar_interactions FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_ar_interactions_bounty ON ar_interactions(bounty_id);
CREATE INDEX IF NOT EXISTS idx_ar_interactions_user ON ar_interactions(user_id);

-- ============================================================================
-- DYNAMIC NFT REPUTATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS dynamic_nfts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  token_id text,
  contract_address text,
  current_level integer DEFAULT 1,
  total_xp integer DEFAULT 0,
  visual_traits jsonb DEFAULT '{}',
  metadata_uri text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dynamic_nfts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view NFTs"
  ON dynamic_nfts FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage own NFT"
  ON dynamic_nfts FOR ALL TO authenticated
  USING ((select auth.uid()) = profile_id)
  WITH CHECK ((select auth.uid()) = profile_id);

CREATE TABLE IF NOT EXISTS nft_evolution_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id uuid REFERENCES dynamic_nfts(id) ON DELETE CASCADE,
  level integer NOT NULL,
  xp_earned integer NOT NULL,
  trigger_event text NOT NULL,
  metadata_snapshot jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nft_evolution_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view NFT history"
  ON nft_evolution_history FOR SELECT TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_nft_evolution_nft ON nft_evolution_history(nft_id);

-- ============================================================================
-- LIVE STREAMING CHALLENGES
-- ============================================================================

ALTER TABLE bounties ADD COLUMN IF NOT EXISTS is_live_stream boolean DEFAULT false;
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS stream_url text;
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS stream_status text CHECK (stream_status IN ('scheduled', 'live', 'ended'));
ALTER TABLE bounties ADD COLUMN IF NOT EXISTS scheduled_stream_time timestamptz;

CREATE TABLE IF NOT EXISTS stream_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE,
  host_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  stream_key text,
  rtmp_url text,
  playback_url text,
  viewer_count integer DEFAULT 0,
  status text DEFAULT 'scheduled',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stream_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active streams"
  ON stream_sessions FOR SELECT TO authenticated
  USING (status = 'live' OR (select auth.uid()) = host_id);

CREATE POLICY "Hosts can manage streams"
  ON stream_sessions FOR ALL TO authenticated
  USING ((select auth.uid()) = host_id)
  WITH CHECK ((select auth.uid()) = host_id);

CREATE TABLE IF NOT EXISTS stream_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES stream_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  message_type text DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stream_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stream chat"
  ON stream_chat FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON stream_chat FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_stream_chat_session ON stream_chat(session_id);

-- ============================================================================
-- AI INTEGRATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  generation_type text NOT NULL CHECK (generation_type IN ('challenge', 'proposal', 'image', 'video', 'pitch')),
  prompt text NOT NULL,
  generated_content jsonb NOT NULL,
  model_used text,
  tokens_used integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations"
  ON ai_generations FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create generations"
  ON ai_generations FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS ai_challenge_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  suggested_title text NOT NULL,
  suggested_description text NOT NULL,
  suggested_reward numeric NOT NULL,
  suggested_tags text[],
  ai_confidence_score numeric,
  accepted boolean DEFAULT false,
  created_bounty_id uuid REFERENCES bounties(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_challenge_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI suggestions"
  ON ai_challenge_suggestions FOR SELECT TO authenticated
  USING ((select auth.uid()) = profile_id);

CREATE POLICY "Users can manage AI suggestions"
  ON ai_challenge_suggestions FOR ALL TO authenticated
  USING ((select auth.uid()) = profile_id)
  WITH CHECK ((select auth.uid()) = profile_id);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_profile ON ai_challenge_suggestions(profile_id);

-- ============================================================================
-- GEOLOCATION BOUNTIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS geolocated_bounties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid UNIQUE REFERENCES bounties(id) ON DELETE CASCADE,
  latitude numeric(10, 8) NOT NULL,
  longitude numeric(11, 8) NOT NULL,
  radius_meters integer NOT NULL DEFAULT 100,
  city text,
  country text,
  unlock_requirement text DEFAULT 'proximity',
  is_treasure_hunt boolean DEFAULT false,
  clue_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE geolocated_bounties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view geolocated bounties"
  ON geolocated_bounties FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Creators can add geolocation"
  ON geolocated_bounties FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bounties
      WHERE bounties.id = geolocated_bounties.bounty_id
      AND bounties.creator_id = (select auth.uid())
    )
  );

CREATE TABLE IF NOT EXISTS bounty_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  unlock_latitude numeric(10, 8),
  unlock_longitude numeric(11, 8),
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(bounty_id, user_id)
);

ALTER TABLE bounty_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlocks"
  ON bounty_unlocks FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can unlock bounties"
  ON bounty_unlocks FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_bounty_unlocks_bounty ON bounty_unlocks(bounty_id);
CREATE INDEX IF NOT EXISTS idx_bounty_unlocks_user ON bounty_unlocks(user_id);

-- ============================================================================
-- INSTANT PAYOUTS & STREAMING
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  stream_contract_address text,
  token_address text NOT NULL,
  flow_rate numeric NOT NULL,
  total_streamed numeric DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment streams"
  ON payment_streams FOR SELECT TO authenticated
  USING ((select auth.uid()) = recipient_id);

CREATE POLICY "Anyone can view active streams"
  ON payment_streams FOR SELECT TO authenticated
  USING (status = 'active');

CREATE INDEX IF NOT EXISTS idx_payment_streams_recipient ON payment_streams(recipient_id);
CREATE INDEX IF NOT EXISTS idx_payment_streams_bounty ON payment_streams(bounty_id);

-- ============================================================================
-- VOTER REWARDS & LOTTERY
-- ============================================================================

CREATE TABLE IF NOT EXISTS lottery_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number integer UNIQUE NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  prize_pool numeric NOT NULL,
  winner_count integer DEFAULT 10,
  status text DEFAULT 'active' CHECK (status IN ('active', 'drawing', 'completed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lottery_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lottery rounds"
  ON lottery_rounds FOR SELECT TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS lottery_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid REFERENCES lottery_rounds(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  entry_count integer DEFAULT 1,
  votes_cast integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(round_id, user_id)
);

ALTER TABLE lottery_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lottery entries"
  ON lottery_entries FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Anyone can view all entries"
  ON lottery_entries FOR SELECT TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS lottery_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid REFERENCES lottery_rounds(id) ON DELETE CASCADE,
  winner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  prize_amount numeric NOT NULL,
  claimed boolean DEFAULT false,
  claimed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lottery_winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lottery winners"
  ON lottery_winners FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Winners can update claim status"
  ON lottery_winners FOR UPDATE TO authenticated
  USING ((select auth.uid()) = winner_id)
  WITH CHECK ((select auth.uid()) = winner_id);

-- ============================================================================
-- GAMIFIED ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activity_heatmap (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date date NOT NULL,
  bounties_created integer DEFAULT 0,
  submissions_made integer DEFAULT 0,
  votes_cast integer DEFAULT 0,
  comments_posted integer DEFAULT 0,
  activity_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

ALTER TABLE user_activity_heatmap ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own heatmap"
  ON user_activity_heatmap FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Anyone can view public heatmaps"
  ON user_activity_heatmap FOR SELECT TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_heatmap_user_date ON user_activity_heatmap(user_id, activity_date);

CREATE TABLE IF NOT EXISTS user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  streak_type text DEFAULT 'daily',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON user_streaks FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Anyone can view all streaks"
  ON user_streaks FOR SELECT TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS success_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE,
  prediction_score numeric NOT NULL,
  prediction_factors jsonb,
  actual_outcome text,
  accuracy_score numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE success_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own predictions"
  ON success_predictions FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS platform_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date UNIQUE NOT NULL,
  total_bounties integer DEFAULT 0,
  active_users integer DEFAULT 0,
  total_volume numeric DEFAULT 0,
  avg_completion_time numeric,
  top_categories jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platform analytics"
  ON platform_analytics FOR SELECT TO authenticated
  USING (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_nft_level()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE dynamic_nfts
  SET 
    current_level = FLOOR(NEW.total_xp / 1000) + 1,
    last_updated = NOW()
  WHERE profile_id = NEW.profile_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_last_date date;
  v_current_streak integer;
BEGIN
  SELECT last_activity_date, current_streak
  INTO v_last_date, v_current_streak
  FROM user_streaks
  WHERE user_id = NEW.user_id;

  IF v_last_date IS NULL OR v_last_date < CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE user_streaks
    SET 
      current_streak = 1,
      last_activity_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSIF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE user_streaks
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_activity_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER update_nft_on_xp_change
  AFTER UPDATE OF total_xp ON dynamic_nfts
  FOR EACH ROW
  EXECUTE FUNCTION update_nft_level();

CREATE TRIGGER update_streak_on_activity
  AFTER INSERT ON user_activity_heatmap
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();
