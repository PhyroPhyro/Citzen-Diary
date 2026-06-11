CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  source VARCHAR(10) NOT NULL CHECK (source IN ('llm', 'template')),
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  location_id VARCHAR(50) NOT NULL,
  location_name VARCHAR(100) NOT NULL,
  task_id VARCHAR(50) NOT NULL,
  mood_state VARCHAR(50),
  is_grouped BOOLEAN DEFAULT false,
  group_count INTEGER,
  is_anchored BOOLEAN DEFAULT false,
  milestone_id UUID
);

CREATE INDEX IF NOT EXISTS idx_diary_character_id ON diary_entries(character_id);
CREATE INDEX IF NOT EXISTS idx_diary_occurred_at ON diary_entries(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_diary_anchored ON diary_entries(character_id, is_anchored);
