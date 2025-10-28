/*
  # Sistema de Retos Modularizados y Multi-etapa

  ## Nuevas Tablas
  
  ### `bounty_phases`
  - Gestiona las etapas de retos complejos
  - Cada fase tiene su propio smart contract y recompensa
  - Permite colaboración entre múltiples solucionadores
  
  ### `phase_submissions`
  - Envíos específicos por fase
  - Permite múltiples colaboradores por reto
  
  ### `bounty_collaborators`
  - Gestiona equipos y colaboración en retos
  - Reparto automático de recompensas

  ## Características
  - Retos divididos en fases (research, prototipo, testing, entrega)
  - Smart contracts independientes por fase
  - Recompensas parciales automáticas
  - Escalado dinámico de fondos durante el reto
  
  ## Seguridad
  - RLS habilitado en todas las tablas
  - Políticas restrictivas por defecto
  - Solo creadores y colaboradores pueden modificar
*/

-- Tabla de fases de bounties
CREATE TABLE IF NOT EXISTS bounty_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE NOT NULL,
  phase_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  reward_amount numeric NOT NULL DEFAULT 0,
  reward_token text NOT NULL DEFAULT 'ETH',
  deadline timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  smart_contract_address text,
  requirements jsonb DEFAULT '[]'::jsonb,
  deliverables jsonb DEFAULT '[]'::jsonb,
  completed_at timestamptz,
  winner_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(bounty_id, phase_number)
);

-- Tabla de envíos por fase
CREATE TABLE IF NOT EXISTS phase_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid REFERENCES bounty_phases(id) ON DELETE CASCADE NOT NULL,
  submitter_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  submission_url text,
  attachments jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'selected')),
  feedback text,
  score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de colaboradores en bounties
CREATE TABLE IF NOT EXISTS bounty_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES bounties(id) ON DELETE CASCADE NOT NULL,
  collaborator_id uuid REFERENCES profiles(id) NOT NULL,
  role text NOT NULL DEFAULT 'contributor' CHECK (role IN ('lead', 'contributor', 'reviewer')),
  contribution_percentage numeric DEFAULT 0 CHECK (contribution_percentage >= 0 AND contribution_percentage <= 100),
  phases jsonb DEFAULT '[]'::jsonb,
  joined_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'left', 'removed')),
  UNIQUE(bounty_id, collaborator_id)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_bounty_phases_bounty ON bounty_phases(bounty_id);
CREATE INDEX IF NOT EXISTS idx_bounty_phases_status ON bounty_phases(status);
CREATE INDEX IF NOT EXISTS idx_phase_submissions_phase ON phase_submissions(phase_id);
CREATE INDEX IF NOT EXISTS idx_phase_submissions_submitter ON phase_submissions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_bounty_collaborators_bounty ON bounty_collaborators(bounty_id);
CREATE INDEX IF NOT EXISTS idx_bounty_collaborators_user ON bounty_collaborators(collaborator_id);

-- Habilitar RLS
ALTER TABLE bounty_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_collaborators ENABLE ROW LEVEL SECURITY;

-- Políticas para bounty_phases
CREATE POLICY "Anyone can view active phases"
  ON bounty_phases FOR SELECT
  TO authenticated
  USING (status IN ('active', 'completed'));

CREATE POLICY "Creators can manage their bounty phases"
  ON bounty_phases FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bounties
      WHERE bounties.id = bounty_phases.bounty_id
      AND bounties.creator_id = auth.uid()
    )
  );

-- Políticas para phase_submissions
CREATE POLICY "Users can view phase submissions"
  ON phase_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create phase submissions"
  ON phase_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Users can update own submissions"
  ON phase_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = submitter_id)
  WITH CHECK (auth.uid() = submitter_id);

-- Políticas para bounty_collaborators
CREATE POLICY "Anyone can view collaborators"
  ON bounty_collaborators FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Creators can add collaborators"
  ON bounty_collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bounties
      WHERE bounties.id = bounty_collaborators.bounty_id
      AND bounties.creator_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can leave"
  ON bounty_collaborators FOR UPDATE
  TO authenticated
  USING (auth.uid() = collaborator_id)
  WITH CHECK (auth.uid() = collaborator_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_bounty_phases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bounty_phases_updated_at
  BEFORE UPDATE ON bounty_phases
  FOR EACH ROW
  EXECUTE FUNCTION update_bounty_phases_updated_at();

CREATE TRIGGER phase_submissions_updated_at
  BEFORE UPDATE ON phase_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_bounty_phases_updated_at();
