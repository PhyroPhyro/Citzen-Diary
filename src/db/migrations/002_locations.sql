CREATE TABLE IF NOT EXISTS locations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region_id VARCHAR(50) REFERENCES regions(id),
  type VARCHAR(50) NOT NULL,
  population INTEGER DEFAULT 0,
  description TEXT,
  connections JSONB DEFAULT '[]'
);
