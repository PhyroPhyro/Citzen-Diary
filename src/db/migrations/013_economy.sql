CREATE TABLE IF NOT EXISTS resources (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('raw', 'processed', 'luxury', 'consumable', 'weapon', 'tool', 'magical')),
  base_price NUMERIC(8,2) NOT NULL DEFAULT 0,
  weight NUMERIC(6,2) NOT NULL DEFAULT 1,
  description TEXT
);

CREATE TABLE IF NOT EXISTS inventories (
  character_id UUID PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  gold NUMERIC(10,2) NOT NULL DEFAULT 50.0,
  storage_capacity NUMERIC(8,2) NOT NULL DEFAULT 50.0,
  storage_used NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  resource_id VARCHAR(50) NOT NULL REFERENCES resources(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  UNIQUE(character_id, resource_id)
);

CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id VARCHAR(50) NOT NULL REFERENCES locations(id),
  resource_id VARCHAR(50) NOT NULL REFERENCES resources(id),
  current_price NUMERIC(8,2) NOT NULL,
  base_price NUMERIC(8,2) NOT NULL,
  volatility NUMERIC(4,2) NOT NULL DEFAULT 0.1,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, resource_id)
);

CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id VARCHAR(50) NOT NULL,
  location_id VARCHAR(50) NOT NULL,
  price NUMERIC(8,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trade_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id VARCHAR(50) NOT NULL REFERENCES locations(id),
  to_location_id VARCHAR(50) NOT NULL REFERENCES locations(id),
  resource_id VARCHAR(50) NOT NULL REFERENCES resources(id),
  profit_margin NUMERIC(5,3) NOT NULL DEFAULT 0,
  distance INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  discovered_by UUID REFERENCES characters(id),
  discovered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_character ON inventory_items(character_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_location ON market_prices(location_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_resource ON market_prices(resource_id);
CREATE INDEX IF NOT EXISTS idx_price_history_lookup ON price_history(resource_id, location_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_routes_from ON trade_routes(from_location_id);
CREATE INDEX IF NOT EXISTS idx_trade_routes_to ON trade_routes(to_location_id);
