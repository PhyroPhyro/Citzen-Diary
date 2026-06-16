CREATE TABLE IF NOT EXISTS quests (
  id VARCHAR(50) PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  template_id VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  state VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (state IN ('locked', 'available', 'active', 'in_progress', 'completed', 'failed', 'abandoned')),
  current_step_id VARCHAR(50),
  completed_steps JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  tier INTEGER DEFAULT 1,
  rewards JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quests_character ON quests(character_id);
CREATE INDEX IF NOT EXISTS idx_quests_state ON quests(state);
CREATE INDEX IF NOT EXISTS idx_quests_character_active ON quests(character_id, state);
