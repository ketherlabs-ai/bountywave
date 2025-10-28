/*
  # Create Elite Challenges System

  ## New Tables

  1. `elite_challenges`
    - `id` (uuid, primary key)
    - `title` (text) - Challenge title
    - `description` (text) - Full description
    - `reward_amount` (numeric) - Prize in USDC
    - `difficulty` (text) - Difficulty level (expert, advanced, etc)
    - `status` (text) - active, completed, expired
    - `deadline` (timestamptz) - Challenge deadline
    - `max_participants` (integer) - Maximum number of participants
    - `current_participants` (integer) - Current participant count
    - `total_submissions` (integer) - Total submissions received
    - `timelock_hours` (integer) - Minimum duration in hours
    - `requires_audit` (boolean) - Whether audit is required
    - `stack_required` (jsonb) - Required tech stack
    - `skills_required` (jsonb) - Required skills
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - `created_by` (uuid) - Reference to profiles

  2. `elite_challenge_participants`
    - `id` (uuid, primary key)
    - `challenge_id` (uuid) - Reference to elite_challenges
    - `user_id` (uuid) - Reference to profiles
    - `status` (text) - registered, working, submitted, winner
    - `submission_url` (text) - Link to submission
    - `submission_description` (text) - Description of solution
    - `audit_passed` (boolean) - Whether audit passed
    - `submission_date` (timestamptz)
    - `created_at` (timestamptz)

  3. `elite_challenge_tech_details`
    - `id` (uuid, primary key)
    - `challenge_id` (uuid) - Reference to elite_challenges
    - `requirements` (text) - Technical requirements
    - `deliverables` (jsonb) - What needs to be delivered
    - `evaluation_criteria` (jsonb) - How it will be evaluated
    - `resources` (jsonb) - Helpful resources
    - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users
*/

-- Create elite_challenges table
CREATE TABLE IF NOT EXISTS elite_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  reward_amount numeric NOT NULL DEFAULT 0,
  difficulty text NOT NULL DEFAULT 'expert',
  status text NOT NULL DEFAULT 'active',
  deadline timestamptz NOT NULL,
  max_participants integer NOT NULL DEFAULT 15,
  current_participants integer NOT NULL DEFAULT 0,
  total_submissions integer NOT NULL DEFAULT 0,
  timelock_hours integer NOT NULL DEFAULT 48,
  requires_audit boolean NOT NULL DEFAULT true,
  stack_required jsonb DEFAULT '[]'::jsonb,
  skills_required jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

-- Create elite_challenge_participants table
CREATE TABLE IF NOT EXISTS elite_challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES elite_challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'registered',
  submission_url text,
  submission_description text,
  audit_passed boolean DEFAULT false,
  submission_date timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Create elite_challenge_tech_details table
CREATE TABLE IF NOT EXISTS elite_challenge_tech_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES elite_challenges(id) ON DELETE CASCADE,
  requirements text NOT NULL,
  deliverables jsonb DEFAULT '[]'::jsonb,
  evaluation_criteria jsonb DEFAULT '[]'::jsonb,
  resources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE elite_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE elite_challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE elite_challenge_tech_details ENABLE ROW LEVEL SECURITY;

-- Policies for elite_challenges
CREATE POLICY "Anyone can view elite challenges"
  ON elite_challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create elite challenges"
  ON elite_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update their elite challenges"
  ON elite_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Policies for elite_challenge_participants
CREATE POLICY "Anyone can view participants"
  ON elite_challenge_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can register for challenges"
  ON elite_challenge_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON elite_challenge_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for elite_challenge_tech_details
CREATE POLICY "Anyone can view tech details"
  ON elite_challenge_tech_details FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Challenge creator can add tech details"
  ON elite_challenge_tech_details FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM elite_challenges
      WHERE id = challenge_id AND created_by = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_elite_challenges_status ON elite_challenges(status);
CREATE INDEX IF NOT EXISTS idx_elite_challenges_deadline ON elite_challenges(deadline);
CREATE INDEX IF NOT EXISTS idx_elite_challenge_participants_challenge ON elite_challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_elite_challenge_participants_user ON elite_challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_elite_challenge_tech_details_challenge ON elite_challenge_tech_details(challenge_id);

-- Function to increment participant count
CREATE OR REPLACE FUNCTION increment_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE elite_challenges
  SET current_participants = current_participants + 1
  WHERE id = NEW.challenge_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment participant count
CREATE TRIGGER trigger_increment_participant_count
  AFTER INSERT ON elite_challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION increment_participant_count();

-- Function to increment submission count
CREATE OR REPLACE FUNCTION increment_submission_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' AND OLD.status != 'submitted' THEN
    UPDATE elite_challenges
    SET total_submissions = total_submissions + 1
    WHERE id = NEW.challenge_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment submission count
CREATE TRIGGER trigger_increment_submission_count
  AFTER UPDATE ON elite_challenge_participants
  FOR EACH ROW
  EXECUTE FUNCTION increment_submission_count();

-- Insert sample elite challenge
INSERT INTO elite_challenges (
  title,
  description,
  reward_amount,
  difficulty,
  status,
  deadline,
  max_participants,
  current_participants,
  total_submissions,
  timelock_hours,
  requires_audit,
  stack_required,
  skills_required
) VALUES (
  'Zero-Knowledge Proof System',
  'Implementar un sistema completo de pruebas de conocimiento cero con verificación on-chain, compatible con ZK-SNARKs y optimizado para gas efficiency.',
  5000,
  'expert',
  'active',
  now() + interval '48 hours',
  15,
  12,
  8,
  48,
  true,
  '["Circom 2.x", "SnarkJS", "Solidity 0.8+", "Hardhat"]'::jsonb,
  '["Cryptography", "ZK-SNARKs", "Gas Optimization", "Circuit Design"]'::jsonb
) ON CONFLICT DO NOTHING;

-- Insert tech details for sample challenge
INSERT INTO elite_challenge_tech_details (
  challenge_id,
  requirements,
  deliverables,
  evaluation_criteria,
  resources
)
SELECT
  id,
  'Crear un sistema completo de Zero-Knowledge Proofs que permita verificar conocimiento sin revelar información sensible. El sistema debe ser eficiente en gas, seguro y fácil de integrar en aplicaciones Web3 existentes.',
  '[
    "Smart contract de verificación en Solidity optimizado para gas",
    "Circuitos Circom documentados y probados",
    "Suite completa de tests unitarios y de integración",
    "Documentación técnica detallada con ejemplos",
    "Scripts de deployment para testnet y mainnet"
  ]'::jsonb,
  '[
    "Seguridad: El código debe pasar auditoría automatizada",
    "Gas Efficiency: Costo de verificación < 100k gas",
    "Funcionalidad: Pasar todos los casos de prueba",
    "Código: Clean code, bien documentado y siguiendo best practices",
    "Completitud: Todos los entregables incluidos"
  ]'::jsonb,
  '[
    {"title": "Circom Documentation", "url": "https://docs.circom.io"},
    {"title": "SnarkJS Guide", "url": "https://github.com/iden3/snarkjs"},
    {"title": "ZK-SNARKs Tutorial", "url": "https://zkp.science"},
    {"title": "Gas Optimization Patterns", "url": "https://eips.ethereum.org"}
  ]'::jsonb
FROM elite_challenges
WHERE title = 'Zero-Knowledge Proof System'
ON CONFLICT DO NOTHING;
