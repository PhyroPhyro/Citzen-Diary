CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  importance VARCHAR(20) NOT NULL CHECK (importance IN ('decisive', 'relevant', 'minor')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  location_id VARCHAR(50) NOT NULL,
  location_name VARCHAR(100) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  related_character_ids JSONB DEFAULT '[]',
  related_event_id VARCHAR(50),
  diary_entry_id UUID,
  is_active_context BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_character_id ON milestones(character_id);
CREATE INDEX IF NOT EXISTS idx_milestones_importance ON milestones(character_id, importance);
CREATE INDEX IF NOT EXISTS idx_milestones_occurred_at ON milestones(occurred_at DESC);
