CREATE TABLE IF NOT EXISTS world_events (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  region_id VARCHAR(50) REFERENCES regions(id),
  location_ids JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true
);
