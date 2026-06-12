-- Add last_pray_at column to characters
ALTER TABLE characters ADD COLUMN IF NOT EXISTS last_pray_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
