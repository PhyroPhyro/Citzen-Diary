"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSQLAdapter = void 0;
const pg_1 = require("pg");
class PostgreSQLAdapter {
    pool;
    constructor(connectionString) {
        this.pool = new pg_1.Pool({
            connectionString,
        });
    }
    async connect() {
        await this.pool.query('SELECT NOW()');
        console.log('[DB] PostgreSQL adapter connected');
    }
    async disconnect() {
        await this.pool.end();
        console.log('[DB] PostgreSQL adapter disconnected');
    }
    async cleanupTestData(prefix) {
        const likePrefix = `${prefix}%`;
        await this.pool.query('DELETE FROM diary_entries WHERE character_id IN (SELECT id FROM characters WHERE name LIKE $1)', [likePrefix]);
        await this.pool.query('DELETE FROM milestones WHERE character_id IN (SELECT id FROM characters WHERE name LIKE $1)', [likePrefix]);
        await this.pool.query('DELETE FROM relations WHERE character_id IN (SELECT id FROM characters WHERE name LIKE $1)', [likePrefix]);
        await this.pool.query('DELETE FROM player_suggestions WHERE character_id IN (SELECT id FROM characters WHERE name LIKE $1)', [likePrefix]);
        await this.pool.query('DELETE FROM characters WHERE name LIKE $1', [likePrefix]);
        await this.pool.query("DELETE FROM npcs WHERE name LIKE $1", [likePrefix]);
        await this.pool.query("DELETE FROM npcs WHERE name LIKE '%Test%' OR name LIKE '%NPC%' OR name LIKE '%Updated%'", []);
    }
    async healthCheck() {
        try {
            await this.pool.query('SELECT 1');
            return true;
        }
        catch {
            return false;
        }
    }
    character = {
        getById: async (id) => {
            const result = await this.pool.query('SELECT * FROM characters WHERE id = $1', [id]);
            if (result.rows.length === 0)
                return null;
            return this.mapRowToCharacter(result.rows[0]);
        },
        create: async (data) => {
            const now = new Date();
            const result = await this.pool.query(`INSERT INTO characters (
          name, player_id, vocation, position, bio, location_id, activity_id,
          travel_destination, traits, mood, faith, objective, commitments,
          last_tick_at, next_tick_at, last_player_login_at, is_npc,
          emergent_specialization, rich_tick_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *`, [
                data.name || 'Unknown',
                data.playerId || 'anonymous',
                data.vocation || 'andarilho',
                data.position || null,
                data.bio || '',
                data.locationId || 'veldra',
                data.activityId || null,
                data.travelDestination || null,
                JSON.stringify(data.traits || { openness: 5, conscientiousness: 5, extraversion: 5, emotionalStability: 5, agreeableness: 5 }),
                JSON.stringify(data.mood || { joy: 5, sadness: 2, anger: 1, fear: 2, disgust: 1, surprise: 3 }),
                data.faith ?? 5.0,
                JSON.stringify(data.objective || { id: '', description: '', type: 'economic', difficulty: 1, progressScore: 0 }),
                JSON.stringify(data.commitments || []),
                data.lastTickAt || now,
                data.nextTickAt || new Date(now.getTime() + 30 * 60 * 1000),
                data.lastPlayerLoginAt || now,
                data.isNpc || false,
                data.emergentSpecialization || null,
                data.richTickCount || 0,
            ]);
            return this.mapRowToCharacter(result.rows[0]);
        },
        update: async (id, data) => {
            const existing = await this.character.getById(id);
            if (!existing)
                throw new Error(`Character ${id} not found`);
            const fields = [];
            const values = [];
            let idx = 1;
            const fieldMap = {
                name: data.name ?? existing.name,
                player_id: data.playerId ?? existing.playerId,
                vocation: data.vocation ?? existing.vocation,
                position: data.position ?? existing.position,
                bio: data.bio ?? existing.bio,
                location_id: data.locationId ?? existing.locationId,
                activity_id: data.activityId ?? existing.activityId,
                travel_destination: data.travelDestination ?? existing.travelDestination,
                traits: JSON.stringify(data.traits ?? existing.traits),
                mood: JSON.stringify(data.mood ?? existing.mood),
                faith: data.faith ?? existing.faith,
                objective: JSON.stringify(data.objective ?? existing.objective),
                commitments: JSON.stringify(data.commitments ?? existing.commitments),
                last_tick_at: data.lastTickAt ?? existing.lastTickAt,
                next_tick_at: data.nextTickAt ?? existing.nextTickAt,
                last_player_login_at: data.lastPlayerLoginAt ?? existing.lastPlayerLoginAt,
                is_npc: data.isNpc ?? existing.isNpc,
                emergent_specialization: data.emergentSpecialization ?? existing.emergentSpecialization,
                rich_tick_count: data.richTickCount ?? existing.richTickCount,
            };
            for (const [col, val] of Object.entries(fieldMap)) {
                fields.push(`${col} = $${idx}`);
                values.push(val);
                idx++;
            }
            values.push(id);
            await this.pool.query(`UPDATE characters SET ${fields.join(', ')} WHERE id = $${idx}`, values);
            const updated = await this.character.getById(id);
            if (!updated)
                throw new Error(`Character ${id} not found after update`);
            return updated;
        },
        getAllActive: async () => {
            const result = await this.pool.query("SELECT * FROM characters WHERE is_npc = false ORDER BY last_tick_at DESC");
            return result.rows.map((row) => this.mapRowToCharacter(row));
        },
        getByPlayerId: async (playerId) => {
            const result = await this.pool.query("SELECT * FROM characters WHERE player_id = $1 ORDER BY last_tick_at DESC", [playerId]);
            return result.rows.map((row) => this.mapRowToCharacter(row));
        },
        updateObjectiveProgress: async (id, progressScore) => {
            await this.pool.query(`UPDATE characters SET objective = jsonb_set(
          objective::jsonb,
          '{progressScore}',
          $2::jsonb
        ) WHERE id = $1`, [id, JSON.stringify(progressScore)]);
        },
    };
    diary = {
        getByCharacterId: async (characterId, limit = 20) => {
            const result = await this.pool.query(`SELECT * FROM diary_entries WHERE character_id = $1
         ORDER BY occurred_at DESC LIMIT $2`, [characterId, limit]);
            return result.rows.map((row) => this.mapRowToDiaryEntry(row));
        },
        create: async (entry) => {
            const result = await this.pool.query(`INSERT INTO diary_entries (
          character_id, text, source, occurred_at, created_at, location_id,
          location_name, task_id, mood_state, is_grouped, group_count, is_anchored, milestone_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`, [
                entry.characterId || '',
                entry.text || '',
                entry.source || 'template',
                entry.occurredAt || new Date(),
                entry.createdAt || new Date(),
                entry.locationId || '',
                entry.locationName || '',
                entry.taskId || '',
                entry.moodState || 'neutro',
                entry.isGrouped || false,
                entry.groupCount || null,
                entry.isAnchored || false,
                entry.milestoneId || null,
            ]);
            return this.mapRowToDiaryEntry(result.rows[0]);
        },
        getAnchored: async (characterId) => {
            const result = await this.pool.query("SELECT * FROM diary_entries WHERE character_id = $1 AND is_anchored = true ORDER BY occurred_at DESC", [characterId]);
            return result.rows.map((row) => this.mapRowToDiaryEntry(row));
        },
        enforceLimit: async (characterId, limit) => {
            await this.pool.query(`DELETE FROM diary_entries WHERE id IN (
          SELECT id FROM diary_entries
          WHERE character_id = $1
          ORDER BY occurred_at DESC
          OFFSET $2
        )`, [characterId, limit]);
        },
    };
    milestones = {
        getByCharacterId: async (characterId) => {
            const result = await this.pool.query("SELECT * FROM milestones WHERE character_id = $1 ORDER BY occurred_at DESC", [characterId]);
            return result.rows.map((row) => this.mapRowToMilestone(row));
        },
        create: async (data) => {
            const result = await this.pool.query(`INSERT INTO milestones (
          character_id, importance, title, description, occurred_at, location_id,
          location_name, trigger_type, related_character_ids, related_event_id,
          diary_entry_id, is_active_context
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`, [
                data.characterId || '',
                data.importance || 'minor',
                data.title || '',
                data.description || '',
                data.occurredAt || new Date(),
                data.locationId || '',
                data.locationName || '',
                data.triggerType || 'first_visit_new_location',
                JSON.stringify(data.relatedCharacterIds || []),
                data.relatedEventId || null,
                data.diaryEntryId || null,
                data.isActiveContext ?? true,
            ]);
            return this.mapRowToMilestone(result.rows[0]);
        },
        getActiveContext: async (characterId) => {
            const result = await this.pool.query("SELECT * FROM milestones WHERE character_id = $1 AND is_active_context = true ORDER BY occurred_at DESC", [characterId]);
            return result.rows.map((row) => this.mapRowToMilestone(row));
        },
    };
    npcs = {
        getById: async (id) => {
            const result = await this.pool.query('SELECT * FROM npcs WHERE id = $1', [id]);
            if (result.rows.length === 0)
                return null;
            return this.mapRowToNPC(result.rows[0]);
        },
        create: async (data) => {
            const now = new Date();
            const result = await this.pool.query(`INSERT INTO npcs (
          name, named_by_player_id, named_by_player_name, named_at, location_id,
          occupation, dominant_trait, physical_description, first_impression,
          is_named_by_player, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`, [
                data.name || 'Desconhecido',
                data.namedByPlayerId || null,
                data.namedByPlayerName || null,
                data.namedAt || now,
                data.locationId || 'veldra',
                data.occupation || 'Morador',
                data.dominantTrait || 'neutro',
                data.physicalDescription || '',
                data.firstImpression || '',
                data.isNamedByPlayer || false,
                data.createdAt || now,
            ]);
            return this.mapRowToNPC(result.rows[0]);
        },
        update: async (id, data) => {
            const existing = await this.npcs.getById(id);
            if (!existing)
                throw new Error(`NPC ${id} not found`);
            const fields = [];
            const values = [];
            let idx = 1;
            const fieldMap = {
                name: data.name ?? existing.name,
                named_by_player_id: data.namedByPlayerId ?? existing.namedByPlayerId,
                named_by_player_name: data.namedByPlayerName ?? existing.namedByPlayerName,
                named_at: data.namedAt ?? existing.namedAt,
                location_id: data.locationId ?? existing.locationId,
                occupation: data.occupation ?? existing.occupation,
                dominant_trait: data.dominantTrait ?? existing.dominantTrait,
                physical_description: data.physicalDescription ?? existing.physicalDescription,
                first_impression: data.firstImpression ?? existing.firstImpression,
                is_named_by_player: data.isNamedByPlayer ?? existing.isNamedByPlayer,
                created_at: data.createdAt ?? existing.createdAt,
            };
            for (const [col, val] of Object.entries(fieldMap)) {
                fields.push(`${col} = $${idx}`);
                values.push(val);
                idx++;
            }
            values.push(id);
            await this.pool.query(`UPDATE npcs SET ${fields.join(', ')} WHERE id = $${idx}`, values);
            const updated = await this.npcs.getById(id);
            if (!updated)
                throw new Error(`NPC ${id} not found after update`);
            return updated;
        },
        getAll: async () => {
            const result = await this.pool.query('SELECT * FROM npcs ORDER BY created_at DESC');
            return result.rows.map((row) => this.mapRowToNPC(row));
        },
    };
    relations = {
        getByCharacterId: async (characterId) => {
            const result = await this.pool.query("SELECT * FROM relations WHERE character_id = $1 ORDER BY last_interaction_at DESC", [characterId]);
            return result.rows.map((row) => this.mapRowToRelation(row));
        },
        create: async (data) => {
            const now = new Date();
            const result = await this.pool.query(`INSERT INTO relations (
          character_id, target_id, target_type, target_name, relation_type,
          affinity_score, first_met_at, first_met_location_id, last_interaction_at,
          interaction_count, memories
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`, [
                data.characterId || '',
                data.targetId || '',
                data.targetType || 'npc',
                data.targetName || '',
                data.relationType || 'conhecido',
                data.affinityScore ?? 0,
                data.firstMetAt || now,
                data.firstMetLocationId || '',
                data.lastInteractionAt || now,
                data.interactionCount || 0,
                JSON.stringify(data.memories || []),
            ]);
            return this.mapRowToRelation(result.rows[0]);
        },
        update: async (id, data) => {
            const existing = await this.getByIdRaw(id);
            if (!existing)
                throw new Error(`Relation ${id} not found`);
            const fields = [];
            const values = [];
            let idx = 1;
            const fieldMap = {
                target_type: data.targetType ?? existing.target_type,
                target_name: data.targetName ?? existing.target_name,
                relation_type: data.relationType ?? existing.relation_type,
                affinity_score: data.affinityScore ?? existing.affinity_score,
                first_met_at: data.firstMetAt ?? new Date(existing.first_met_at),
                first_met_location_id: data.firstMetLocationId ?? existing.first_met_location_id,
                last_interaction_at: data.lastInteractionAt ?? new Date(existing.last_interaction_at),
                interaction_count: data.interactionCount ?? existing.interaction_count,
                memories: JSON.stringify(data.memories ?? (typeof existing.memories === 'string' ? JSON.parse(existing.memories) : existing.memories || [])),
            };
            for (const [col, val] of Object.entries(fieldMap)) {
                fields.push(`${col} = $${idx}`);
                values.push(val);
                idx++;
            }
            values.push(id);
            await this.pool.query(`UPDATE relations SET ${fields.join(', ')} WHERE id = $${idx}`, values);
            const updated = await this.getByIdRaw(id);
            if (!updated)
                throw new Error(`Relation ${id} not found after update`);
            return this.mapRowToRelation(updated);
        },
        getByTarget: async (characterId, targetId) => {
            const result = await this.pool.query("SELECT * FROM relations WHERE character_id = $1 AND target_id = $2", [characterId, targetId]);
            if (result.rows.length === 0)
                return null;
            return this.mapRowToRelation(result.rows[0]);
        },
    };
    suggestions = {
        getPending: async (characterId) => {
            const result = await this.pool.query("SELECT * FROM player_suggestions WHERE character_id = $1 AND processed_at IS NULL ORDER BY created_at DESC LIMIT 1", [characterId]);
            if (result.rows.length === 0)
                return null;
            return this.mapRowToPendingAction(result.rows[0]);
        },
        create: async (data) => {
            const now = new Date();
            const action = data.action || { type: 'task', message: null };
            const result = await this.pool.query(`INSERT INTO player_suggestions (
          character_id, player_id, action_type, action_data, created_at, processed_at, was_followed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`, [
                data.characterId || '',
                data.playerId || '',
                action.type,
                JSON.stringify(action),
                data.createdAt || now,
                data.processedAt || null,
                data.wasFollowed ?? null,
            ]);
            return this.mapRowToPendingAction(result.rows[0]);
        },
        markProcessed: async (id, wasFollowed) => {
            await this.pool.query('UPDATE player_suggestions SET processed_at = $1, was_followed = $2 WHERE id = $3', [new Date(), wasFollowed, id]);
        },
        replacePending: async (characterId, data) => {
            await this.pool.query("UPDATE player_suggestions SET processed_at = $1, was_followed = false WHERE character_id = $2 AND processed_at IS NULL", [new Date(), characterId]);
            return this.suggestions.create(data);
        },
    };
    world = {
        getLocations: async () => {
            const result = await this.pool.query('SELECT * FROM locations ORDER BY name');
            return result.rows;
        },
        getRegions: async () => {
            const result = await this.pool.query('SELECT * FROM regions ORDER BY name');
            return result.rows;
        },
        getActiveEvents: async () => {
            const result = await this.pool.query("SELECT * FROM world_events WHERE is_active = true ORDER BY name");
            return result.rows;
        },
    };
    async getByIdRaw(id) {
        const result = await this.pool.query('SELECT * FROM relations WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    mapRowToCharacter(row) {
        return {
            id: row.id,
            name: row.name,
            playerId: row.player_id,
            vocation: row.vocation,
            position: row.position,
            bio: row.bio,
            locationId: row.location_id,
            activityId: row.activity_id,
            travelDestination: row.travel_destination,
            traits: typeof row.traits === 'string' ? JSON.parse(row.traits) : row.traits,
            mood: typeof row.mood === 'string' ? JSON.parse(row.mood) : row.mood,
            faith: Number(row.faith),
            objective: typeof row.objective === 'string' ? JSON.parse(row.objective) : row.objective,
            commitments: typeof row.commitments === 'string' ? JSON.parse(row.commitments) : row.commitments,
            lastTickAt: new Date(row.last_tick_at),
            nextTickAt: new Date(row.next_tick_at),
            lastPlayerLoginAt: new Date(row.last_player_login_at),
            isNpc: row.is_npc,
            emergentSpecialization: row.emergent_specialization,
            richTickCount: Number(row.rich_tick_count),
        };
    }
    mapRowToDiaryEntry(row) {
        return {
            id: row.id,
            characterId: row.character_id,
            text: row.text,
            source: row.source,
            occurredAt: new Date(row.occurred_at),
            createdAt: new Date(row.created_at),
            locationId: row.location_id,
            locationName: row.location_name,
            taskId: row.task_id,
            moodState: row.mood_state,
            isGrouped: row.is_grouped,
            groupCount: row.group_count ? Number(row.group_count) : null,
            isAnchored: row.is_anchored,
            milestoneId: row.milestone_id,
        };
    }
    mapRowToMilestone(row) {
        return {
            id: row.id,
            characterId: row.character_id,
            importance: row.importance,
            title: row.title,
            description: row.description,
            occurredAt: new Date(row.occurred_at),
            locationId: row.location_id,
            locationName: row.location_name,
            triggerType: row.trigger_type,
            relatedCharacterIds: typeof row.related_character_ids === 'string' ? JSON.parse(row.related_character_ids) : row.related_character_ids || [],
            relatedEventId: row.related_event_id,
            diaryEntryId: row.diary_entry_id,
            isActiveContext: row.is_active_context,
        };
    }
    mapRowToNPC(row) {
        return {
            id: row.id,
            name: row.name,
            namedByPlayerId: row.named_by_player_id,
            namedByPlayerName: row.named_by_player_name,
            namedAt: new Date(row.named_at),
            locationId: row.location_id,
            occupation: row.occupation,
            dominantTrait: row.dominant_trait,
            physicalDescription: row.physical_description,
            firstImpression: row.first_impression,
            isNamedByPlayer: row.is_named_by_player,
            createdAt: new Date(row.created_at),
        };
    }
    mapRowToRelation(row) {
        return {
            id: row.id,
            characterId: row.character_id,
            targetId: row.target_id,
            targetType: row.target_type,
            targetName: row.target_name,
            relationType: row.relation_type,
            affinityScore: Number(row.affinity_score),
            firstMetAt: new Date(row.first_met_at),
            firstMetLocationId: row.first_met_location_id,
            lastInteractionAt: new Date(row.last_interaction_at),
            interactionCount: Number(row.interaction_count),
            memories: typeof row.memories === 'string' ? JSON.parse(row.memories) : row.memories || [],
        };
    }
    mapRowToPendingAction(row) {
        return {
            id: row.id,
            characterId: row.character_id,
            playerId: row.player_id,
            action: typeof row.action_data === 'string' ? JSON.parse(row.action_data) : row.action_data,
            createdAt: new Date(row.created_at),
            processedAt: row.processed_at ? new Date(row.processed_at) : null,
            wasFollowed: row.was_followed,
        };
    }
}
exports.PostgreSQLAdapter = PostgreSQLAdapter;
//# sourceMappingURL=pg-adapter.js.map