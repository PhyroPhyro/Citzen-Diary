"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const pg_adapter_1 = require("./pg-adapter");
const TEST_DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:382356@localhost:5432/citizen_diary';
(0, vitest_1.describe)('PostgreSQLAdapter', () => {
    let adapter;
    (0, vitest_1.beforeAll)(async () => {
        adapter = new pg_adapter_1.PostgreSQLAdapter(TEST_DB_URL);
        await adapter.connect();
    });
    (0, vitest_1.afterAll)(async () => {
        await adapter.disconnect();
    });
    (0, vitest_1.describe)('healthCheck', () => {
        (0, vitest_1.it)('returns true when database is reachable', async () => {
            const result = await adapter.healthCheck();
            (0, vitest_1.expect)(result).toBe(true);
        });
    });
    (0, vitest_1.describe)('character', () => {
        (0, vitest_1.it)('creates a character with defaults', async () => {
            const character = await adapter.character.create({
                name: 'Test Character',
                playerId: 'test-player',
                vocation: 'andarilho',
            });
            (0, vitest_1.expect)(character.id).toBeDefined();
            (0, vitest_1.expect)(character.name).toBe('Test Character');
            (0, vitest_1.expect)(character.playerId).toBe('test-player');
            (0, vitest_1.expect)(character.vocation).toBe('andarilho');
            (0, vitest_1.expect)(character.faith).toBe(5);
            (0, vitest_1.expect)(character.isNpc).toBe(false);
            (0, vitest_1.expect)(character.traits.openness).toBe(5);
            (0, vitest_1.expect)(character.mood.joy).toBe(5);
        });
        (0, vitest_1.it)('gets a character by id', async () => {
            const created = await adapter.character.create({
                name: 'Get Test',
                playerId: 'test-player',
                vocation: 'lavrador',
            });
            const found = await adapter.character.getById(created.id);
            (0, vitest_1.expect)(found).not.toBeNull();
            (0, vitest_1.expect)(found?.name).toBe('Get Test');
        });
        (0, vitest_1.it)('returns null for non-existent character', async () => {
            const found = await adapter.character.getById('00000000-0000-0000-0000-000000000000');
            (0, vitest_1.expect)(found).toBeNull();
        });
        (0, vitest_1.it)('updates a character', async () => {
            const created = await adapter.character.create({
                name: 'Update Test',
                playerId: 'test-player',
                vocation: 'andarilho',
            });
            const updated = await adapter.character.update(created.id, {
                name: 'Updated Name',
                faith: 7,
            });
            (0, vitest_1.expect)(updated.name).toBe('Updated Name');
            (0, vitest_1.expect)(updated.faith).toBe(7);
        });
        (0, vitest_1.it)('gets all active characters', async () => {
            await adapter.character.create({
                name: 'Active Test 1',
                playerId: 'test-player',
                vocation: 'andarilho',
            });
            const active = await adapter.character.getAllActive();
            (0, vitest_1.expect)(active.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(active.some((c) => c.name === 'Active Test 1')).toBe(true);
        });
        (0, vitest_1.it)('gets characters by player id', async () => {
            const playerId = `player-${Date.now()}`;
            await adapter.character.create({
                name: 'Player Char 1',
                playerId,
                vocation: 'andarilho',
            });
            await adapter.character.create({
                name: 'Player Char 2',
                playerId,
                vocation: 'lavrador',
            });
            const chars = await adapter.character.getByPlayerId(playerId);
            (0, vitest_1.expect)(chars.length).toBe(2);
            (0, vitest_1.expect)(chars.every((c) => c.playerId === playerId)).toBe(true);
        });
    });
    (0, vitest_1.describe)('diary', () => {
        (0, vitest_1.it)('creates a diary entry', async () => {
            const character = await adapter.character.create({
                name: 'Diary Test',
                playerId: 'test-player',
                vocation: 'andarilho',
            });
            const entry = await adapter.diary.create({
                characterId: character.id,
                text: 'Test diary entry',
                source: 'template',
                locationId: 'veldra',
                locationName: 'Veldra',
                taskId: 'walk',
            });
            (0, vitest_1.expect)(entry.id).toBeDefined();
            (0, vitest_1.expect)(entry.text).toBe('Test diary entry');
            (0, vitest_1.expect)(entry.source).toBe('template');
        });
        (0, vitest_1.it)('gets diary entries by character id', async () => {
            const character = await adapter.character.create({
                name: 'Diary Get Test',
                playerId: 'test-player',
                vocation: 'andarilho',
            });
            await adapter.diary.create({
                characterId: character.id,
                text: 'Entry 1',
                source: 'template',
                locationId: 'veldra',
                locationName: 'Veldra',
                taskId: 'walk',
            });
            await adapter.diary.create({
                characterId: character.id,
                text: 'Entry 2',
                source: 'template',
                locationId: 'veldra',
                locationName: 'Veldra',
                taskId: 'walk',
            });
            const entries = await adapter.diary.getByCharacterId(character.id);
            (0, vitest_1.expect)(entries.length).toBe(2);
        });
        (0, vitest_1.it)('enforces diary limit', async () => {
            const character = await adapter.character.create({
                name: 'Diary Limit Test',
                playerId: 'test-player',
                vocation: 'andarilho',
            });
            for (let i = 0; i < 5; i++) {
                await adapter.diary.create({
                    characterId: character.id,
                    text: `Entry ${i}`,
                    source: 'template',
                    locationId: 'veldra',
                    locationName: 'Veldra',
                    taskId: 'walk',
                });
            }
            await adapter.diary.enforceLimit(character.id, 3);
            const entries = await adapter.diary.getByCharacterId(character.id, 10);
            (0, vitest_1.expect)(entries.length).toBeLessThanOrEqual(3);
        });
    });
    (0, vitest_1.describe)('milestones', () => {
        (0, vitest_1.it)('creates a milestone', async () => {
            const character = await adapter.character.create({
                name: 'Milestone Test',
                playerId: 'test-player',
                vocation: 'andarilho',
            });
            const milestone = await adapter.milestones.create({
                characterId: character.id,
                title: 'First Milestone',
                description: 'A test milestone',
                importance: 'minor',
                triggerType: 'first_visit_new_location',
                locationId: 'veldra',
                locationName: 'Veldra',
            });
            (0, vitest_1.expect)(milestone.id).toBeDefined();
            (0, vitest_1.expect)(milestone.title).toBe('First Milestone');
            (0, vitest_1.expect)(milestone.isActiveContext).toBe(true);
        });
        (0, vitest_1.it)('gets milestones by character id', async () => {
            const character = await adapter.character.create({
                name: 'Milestone Get Test',
                playerId: 'test-player',
                vocation: 'andarilho',
            });
            await adapter.milestones.create({
                characterId: character.id,
                title: 'MS 1',
                description: 'Desc 1',
                importance: 'minor',
                triggerType: 'first_visit_new_location',
                locationId: 'veldra',
                locationName: 'Veldra',
            });
            const milestones = await adapter.milestones.getByCharacterId(character.id);
            (0, vitest_1.expect)(milestones.length).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('npcs', () => {
        (0, vitest_1.it)('creates an NPC', async () => {
            const npc = await adapter.npcs.create({
                name: 'Test NPC',
                locationId: 'veldra',
                occupation: 'Merchant',
            });
            (0, vitest_1.expect)(npc.id).toBeDefined();
            (0, vitest_1.expect)(npc.name).toBe('Test NPC');
            (0, vitest_1.expect)(npc.isNamedByPlayer).toBe(false);
        });
        (0, vitest_1.it)('updates an NPC', async () => {
            const npc = await adapter.npcs.create({
                name: 'Update NPC Test',
                locationId: 'veldra',
            });
            const updated = await adapter.npcs.update(npc.id, {
                name: 'Updated NPC',
                isNamedByPlayer: true,
                namedByPlayerId: 'player-1',
                namedByPlayerName: 'Hero',
            });
            (0, vitest_1.expect)(updated.name).toBe('Updated NPC');
            (0, vitest_1.expect)(updated.isNamedByPlayer).toBe(true);
        });
        (0, vitest_1.it)('gets all NPCs', async () => {
            await adapter.npcs.create({
                name: 'All NPCs Test',
                locationId: 'veldra',
            });
            const npcs = await adapter.npcs.getAll();
            (0, vitest_1.expect)(npcs.length).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('relations', () => {
        (0, vitest_1.it)('creates a relation', async () => {
            const character = await adapter.character.create({
                name: 'Relation Test',
                playerId: 'test-player',
                vocation: 'andarilho',
            });
            const relation = await adapter.relations.create({
                characterId: character.id,
                targetId: 'npc-1',
                targetType: 'npc',
                targetName: 'Test NPC',
                relationType: 'conhecido',
            });
            (0, vitest_1.expect)(relation.id).toBeDefined();
            (0, vitest_1.expect)(relation.affinityScore).toBe(0);
        });
        (0, vitest_1.it)('gets relations by character id', async () => {
            const character = await adapter.character.create({
                name: 'Relation Get Test',
                playerId: 'test-player',
                vocation: 'andarilho',
            });
            await adapter.relations.create({
                characterId: character.id,
                targetId: 'npc-1',
                targetType: 'npc',
                targetName: 'NPC 1',
                relationType: 'conhecido',
            });
            const relations = await adapter.relations.getByCharacterId(character.id);
            (0, vitest_1.expect)(relations.length).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('suggestions', () => {
        (0, vitest_1.it)('creates a suggestion', async () => {
            const character = await adapter.character.create({
                name: 'Suggestion Test',
                playerId: 'test-player',
                vocation: 'andarilho',
            });
            const suggestion = await adapter.suggestions.create({
                characterId: character.id,
                playerId: character.playerId,
                action: { type: 'task', taskId: 'harvest', message: 'Try harvesting' },
            });
            (0, vitest_1.expect)(suggestion.id).toBeDefined();
            (0, vitest_1.expect)(suggestion.processedAt).toBeNull();
        });
        (0, vitest_1.it)('gets pending suggestion', async () => {
            const character = await adapter.character.create({
                name: 'Pending Suggestion Test',
                playerId: 'test-player',
                vocation: 'andarilho',
            });
            await adapter.suggestions.create({
                characterId: character.id,
                playerId: character.playerId,
                action: { type: 'destination', locationId: 'arvel', message: null },
            });
            const pending = await adapter.suggestions.getPending(character.id);
            (0, vitest_1.expect)(pending).not.toBeNull();
            (0, vitest_1.expect)(pending?.processedAt).toBeNull();
        });
        (0, vitest_1.it)('marks suggestion as processed', async () => {
            const character = await adapter.character.create({
                name: 'Mark Processed Test',
                playerId: 'test-player',
                vocation: 'andarilho',
            });
            const suggestion = await adapter.suggestions.create({
                characterId: character.id,
                playerId: character.playerId,
                action: { type: 'vision', text: 'Go north', message: null },
            });
            await adapter.suggestions.markProcessed(suggestion.id, true);
            const pending = await adapter.suggestions.getPending(character.id);
            (0, vitest_1.expect)(pending).toBeNull();
        });
    });
    (0, vitest_1.describe)('world', () => {
        (0, vitest_1.it)('gets locations', async () => {
            const locations = await adapter.world.getLocations();
            (0, vitest_1.expect)(locations.length).toBe(15);
        });
        (0, vitest_1.it)('gets regions', async () => {
            const regions = await adapter.world.getRegions();
            (0, vitest_1.expect)(regions.length).toBe(5);
        });
        (0, vitest_1.it)('gets active events', async () => {
            const events = await adapter.world.getActiveEvents();
            (0, vitest_1.expect)(events.length).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=pg-adapter.test.js.map