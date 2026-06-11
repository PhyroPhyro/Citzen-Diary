CREATE TABLE IF NOT EXISTS relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  target_id VARCHAR(100) NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('npc', 'player_character')),
  target_name VARCHAR(100) NOT NULL,
  relation_type VARCHAR(50) DEFAULT 'conhecido',
  affinity_score INTEGER DEFAULT 0,
  first_met_at TIMESTAMPTZ DEFAULT NOW(),
  first_met_location_id VARCHAR(50),
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  interaction_count INTEGER DEFAULT 0,
  memories JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relations_character_id ON relations(character_id);
CREATE INDEX IF NOT EXISTS idx_relations_target ON relations(character_id, target_id);
