CREATE TABLE IF NOT EXISTS regions (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  climate TEXT,
  culture TEXT,
  dominant_power TEXT,
  narrative_tone TEXT
);
