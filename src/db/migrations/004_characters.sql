CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  player_id VARCHAR(100) NOT NULL,

  vocation VARCHAR(50) NOT NULL,
  position VARCHAR(100),
  bio TEXT,

  location_id VARCHAR(50) REFERENCES locations(id) DEFAULT 'veldra',
  activity_id VARCHAR(50),
  travel_destination VARCHAR(50),

  traits JSONB NOT NULL DEFAULT '{"openness":5,"conscientiousness":5,"extraversion":5,"emotionalStability":5,"agreeableness":5}',
  mood JSONB NOT NULL DEFAULT '{"joy":5,"sadness":2,"anger":1,"fear":2,"disgust":1,"surprise":3}',

  faith NUMERIC(3,1) DEFAULT 5.0,
  objective JSONB NOT NULL DEFAULT '{"id":"","description":"","type":"economic","difficulty":1,"progressScore":0}',

  commitments JSONB DEFAULT '[]',

  last_tick_at TIMESTAMPTZ DEFAULT NOW(),
  next_tick_at TIMESTAMPTZ DEFAULT NOW(),
  last_player_login_at TIMESTAMPTZ DEFAULT NOW(),
  is_npc BOOLEAN DEFAULT false,

  emergent_specialization VARCHAR(200),
  rich_tick_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_characters_player_id ON characters(player_id);
CREATE INDEX IF NOT EXISTS idx_characters_is_npc ON characters(is_npc);
CREATE INDEX IF NOT EXISTS idx_characters_next_tick ON characters(next_tick_at);
