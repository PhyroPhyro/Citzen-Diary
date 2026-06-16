CREATE TABLE IF NOT EXISTS skills (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  vocation VARCHAR(50),
  category VARCHAR(20) NOT NULL DEFAULT 'combat',
  max_level INTEGER DEFAULT 10,
  base_xp_per_use INTEGER DEFAULT 10
);

CREATE TABLE IF NOT EXISTS character_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  skill_id VARCHAR(50) NOT NULL REFERENCES skills(id),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  UNIQUE(character_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_character_skills_char ON character_skills(character_id);

CREATE TABLE IF NOT EXISTS combat_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  enemy_name VARCHAR(100) NOT NULL,
  enemy_type VARCHAR(50) NOT NULL,
  outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('victory', 'defeat', 'retreat')),
  rounds INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  loot JSONB DEFAULT '[]',
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_combat_log_char ON combat_log(character_id);
