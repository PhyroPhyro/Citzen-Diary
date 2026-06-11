CREATE TABLE IF NOT EXISTS npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  named_by_player_id VARCHAR(100),
  named_by_player_name VARCHAR(100),
  named_at TIMESTAMPTZ DEFAULT NOW(),
  location_id VARCHAR(50) REFERENCES locations(id),
  occupation TEXT,
  dominant_trait VARCHAR(50),
  physical_description TEXT,
  first_impression TEXT,
  is_named_by_player BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_npcs_location ON npcs(location_id);
CREATE INDEX IF NOT EXISTS idx_npcs_named_by_player ON npcs(is_named_by_player);
