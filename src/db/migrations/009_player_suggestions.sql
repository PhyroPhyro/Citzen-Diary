CREATE TABLE IF NOT EXISTS player_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  player_id VARCHAR(100) NOT NULL,
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('task', 'destination', 'vision')),
  action_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  was_followed BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_suggestions_character_id ON player_suggestions(character_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_processed ON player_suggestions(character_id, processed_at);
