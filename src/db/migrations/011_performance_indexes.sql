-- Performance indexes for frequent queries

-- Character lookups
CREATE INDEX IF NOT EXISTS idx_characters_player_id ON characters(player_id);
CREATE INDEX IF NOT EXISTS idx_characters_is_npc ON characters(is_npc);
CREATE INDEX IF NOT EXISTS idx_characters_next_tick ON characters(next_tick_at) WHERE is_npc = false;
CREATE INDEX IF NOT EXISTS idx_characters_last_login ON characters(last_player_login_at);

-- Diary entries
CREATE INDEX IF NOT EXISTS idx_diary_character_occurred ON diary_entries(character_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_diary_anchored ON diary_entries(character_id) WHERE is_anchored = true;
CREATE INDEX IF NOT EXISTS idx_diary_source ON diary_entries(character_id, source);

-- Milestones
CREATE INDEX IF NOT EXISTS idx_milestones_character_occurred ON milestones(character_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_milestones_active ON milestones(character_id) WHERE is_active_context = true;

-- Relations
CREATE INDEX IF NOT EXISTS idx_relations_character_target ON relations(character_id, target_id);
CREATE INDEX IF NOT EXISTS idx_relations_last_interaction ON relations(character_id, last_interaction_at DESC);

-- Player suggestions
CREATE INDEX IF NOT EXISTS idx_suggestions_pending ON player_suggestions(character_id) WHERE processed_at IS NULL;

-- NPCs
CREATE INDEX IF NOT EXISTS idx_npcs_location ON npcs(location_id);
