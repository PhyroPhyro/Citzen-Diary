import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgreSQLAdapter } from './pg-adapter';

const TEST_DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:382356@localhost:5432/citizen_diary';
const TEST_PREFIX = '__test__';

describe('PostgreSQLAdapter', () => {
  let adapter: PostgreSQLAdapter;

  beforeAll(async () => {
    adapter = new PostgreSQLAdapter(TEST_DB_URL);
    await adapter.connect();
  });

  afterAll(async () => {
    await adapter.cleanupTestData(TEST_PREFIX);
    await adapter.disconnect();
  });

  beforeEach(async () => {
    await adapter.cleanupTestData(TEST_PREFIX);
  });

  describe('healthCheck', () => {
    it('returns true when database is reachable', async () => {
      const result = await adapter.healthCheck();
      expect(result).toBe(true);
    });
  });

  describe('character', () => {
    it('creates a character with defaults', async () => {
      const character = await adapter.character.create({
        name: `${TEST_PREFIX}_Test Character`,
        playerId: `${TEST_PREFIX}_test-player`,
        vocation: 'andarilho',
      });

      expect(character.id).toBeDefined();
      expect(character.name).toBe(`${TEST_PREFIX}_Test Character`);
      expect(character.playerId).toBe(`${TEST_PREFIX}_test-player`);
      expect(character.vocation).toBe('andarilho');
      expect(character.faith).toBe(5);
      expect(character.isNpc).toBe(false);
      expect(character.traits.openness).toBe(5);
      expect(character.mood.joy).toBe(5);
    });

    it('gets a character by id', async () => {
      const created = await adapter.character.create({
        name: `${TEST_PREFIX}_Get Test`,
        playerId: `${TEST_PREFIX}_test-player`,
        vocation: 'lavrador',
      });


      const found = await adapter.character.getById(created.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe(`${TEST_PREFIX}_Get Test`);
    });

    it('returns null for non-existent character', async () => {
      const found = await adapter.character.getById('00000000-0000-0000-0000-000000000000');
      expect(found).toBeNull();
    });

    it('updates a character', async () => {
      const created = await adapter.character.create({
        name: `${TEST_PREFIX}_Update Test`,
        playerId: `${TEST_PREFIX}_test-player`,
        vocation: 'andarilho',
      });


      const updated = await adapter.character.update(created.id, {
        name: `${TEST_PREFIX}_Updated Name`,
        faith: 7,
      });

      expect(updated.name).toBe(`${TEST_PREFIX}_Updated Name`);
      expect(updated.faith).toBe(7);
    });

    it('gets all active characters', async () => {
      const c = await adapter.character.create({
        name: `${TEST_PREFIX}_Active Test 1`,
        playerId: `${TEST_PREFIX}_test-player`,
        vocation: 'andarilho',
      });


      const active = await adapter.character.getAllActive();
      expect(active.length).toBeGreaterThan(0);
      expect(active.some((ch) => ch.name === `${TEST_PREFIX}_Active Test 1`)).toBe(true);
    });

    it('gets characters by player id', async () => {
      const playerId = `${TEST_PREFIX}_player-${Date.now()}`;
      const c1 = await adapter.character.create({
        name: `${TEST_PREFIX}_Player Char 1`,
        playerId,
        vocation: 'andarilho',
      });

      const c2 = await adapter.character.create({
        name: `${TEST_PREFIX}_Player Char 2`,
        playerId,
        vocation: 'lavrador',
      });

      const chars = await adapter.character.getByPlayerId(playerId);
      expect(chars.length).toBe(2);
      expect(chars.every((ch) => ch.playerId === playerId)).toBe(true);
    });
  });

  describe('diary', () => {
    it('creates a diary entry', async () => {
      const character = await adapter.character.create({
        name: `${TEST_PREFIX}_Diary Test`,
        playerId: `${TEST_PREFIX}_test-player`,
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

      expect(entry.id).toBeDefined();
      expect(entry.text).toBe('Test diary entry');
      expect(entry.source).toBe('template');
    });

    it('gets diary entries by character id', async () => {
      const character = await adapter.character.create({
        name: `${TEST_PREFIX}_Diary Get Test`,
        playerId: `${TEST_PREFIX}_test-player`,
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
      expect(entries.length).toBe(2);
    });

    it('enforces diary limit', async () => {
      const character = await adapter.character.create({
        name: `${TEST_PREFIX}_Diary Limit Test`,
        playerId: `${TEST_PREFIX}_test-player`,
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
      expect(entries.length).toBeLessThanOrEqual(3);
    });
  });

  describe('milestones', () => {
    it('creates a milestone', async () => {
      const character = await adapter.character.create({
        name: `${TEST_PREFIX}_Milestone Test`,
        playerId: `${TEST_PREFIX}_test-player`,
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

      expect(milestone.id).toBeDefined();
      expect(milestone.title).toBe('First Milestone');
      expect(milestone.isActiveContext).toBe(true);
    });

    it('gets milestones by character id', async () => {
      const character = await adapter.character.create({
        name: `${TEST_PREFIX}_Milestone Get Test`,
        playerId: `${TEST_PREFIX}_test-player`,
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
      expect(milestones.length).toBeGreaterThan(0);
    });
  });

  describe('npcs', () => {
    it('creates an NPC', async () => {
      const npc = await adapter.npcs.create({
        name: `${TEST_PREFIX}_Test NPC`,
        locationId: 'veldra',
        occupation: 'Merchant',
      });


      expect(npc.id).toBeDefined();
      expect(npc.name).toBe(`${TEST_PREFIX}_Test NPC`);
      expect(npc.isNamedByPlayer).toBe(false);
    });

    it('updates an NPC', async () => {
      const npc = await adapter.npcs.create({
        name: `${TEST_PREFIX}_Update NPC Test`,
        locationId: 'veldra',
      });


      const updated = await adapter.npcs.update(npc.id, {
        name: `${TEST_PREFIX}_Updated NPC`,
        isNamedByPlayer: true,
        namedByPlayerId: 'player-1',
        namedByPlayerName: 'Hero',
      });

      expect(updated.name).toBe(`${TEST_PREFIX}_Updated NPC`);
      expect(updated.isNamedByPlayer).toBe(true);
    });

    it('gets all NPCs', async () => {
      await adapter.npcs.create({
        name: `${TEST_PREFIX}_All NPCs Test`,
        locationId: 'veldra',
      });

      const npcs = await adapter.npcs.getAll();
      expect(npcs.length).toBeGreaterThan(0);
    });
  });

  describe('relations', () => {
    it('creates a relation', async () => {
      const character = await adapter.character.create({
        name: `${TEST_PREFIX}_Relation Test`,
        playerId: `${TEST_PREFIX}_test-player`,
        vocation: 'andarilho',
      });

      const relation = await adapter.relations.create({
        characterId: character.id,
        targetId: 'npc-1',
        targetType: 'npc',
        targetName: 'Test NPC',
        relationType: 'conhecido',
      });

      expect(relation.id).toBeDefined();
      expect(relation.affinityScore).toBe(0);
    });

    it('gets relations by character id', async () => {
      const character = await adapter.character.create({
        name: `${TEST_PREFIX}_Relation Get Test`,
        playerId: `${TEST_PREFIX}_test-player`,
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
      expect(relations.length).toBeGreaterThan(0);
    });
  });

  describe('suggestions', () => {
    it('creates a suggestion', async () => {
      const character = await adapter.character.create({
        name: `${TEST_PREFIX}_Suggestion Test`,
        playerId: `${TEST_PREFIX}_test-player`,
        vocation: 'andarilho',
      });

      const suggestion = await adapter.suggestions.create({
        characterId: character.id,
        playerId: character.playerId,
        action: { type: 'task', taskId: 'harvest', message: 'Try harvesting' },
      });

      expect(suggestion.id).toBeDefined();
      expect(suggestion.processedAt).toBeNull();
    });

    it('gets pending suggestion', async () => {
      const character = await adapter.character.create({
        name: `${TEST_PREFIX}_Pending Suggestion Test`,
        playerId: `${TEST_PREFIX}_test-player`,
        vocation: 'andarilho',
      });

      await adapter.suggestions.create({
        characterId: character.id,
        playerId: character.playerId,
        action: { type: 'destination', locationId: 'arvel', message: null },
      });

      const pending = await adapter.suggestions.getPending(character.id);
      expect(pending).not.toBeNull();
      expect(pending?.processedAt).toBeNull();
    });

    it('marks suggestion as processed', async () => {
      const character = await adapter.character.create({
        name: `${TEST_PREFIX}_Mark Processed Test`,
        playerId: `${TEST_PREFIX}_test-player`,
        vocation: 'andarilho',
      });

      const suggestion = await adapter.suggestions.create({
        characterId: character.id,
        playerId: character.playerId,
        action: { type: 'vision', text: 'Go north', message: null },
      });

      await adapter.suggestions.markProcessed(suggestion.id, true);

      const pending = await adapter.suggestions.getPending(character.id);
      expect(pending).toBeNull();
    });
  });

  describe('world', () => {
    it('gets locations', async () => {
      const locations = await adapter.world.getLocations();
      expect(locations.length).toBe(15);
    });

    it('gets regions', async () => {
      const regions = await adapter.world.getRegions();
      expect(regions.length).toBe(5);
    });

    it('gets active events', async () => {
      const events = await adapter.world.getActiveEvents();
      expect(events.length).toBeGreaterThan(0);
    });
  });
});
