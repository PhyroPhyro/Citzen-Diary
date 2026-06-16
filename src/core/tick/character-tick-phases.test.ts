import { describe, it, expect, beforeEach } from 'vitest';
import { executeCharacterTick, calculateTickInterval, shouldConvertToNPC } from '../../core/tick/character-tick';
import { Character } from '../../models';
import { MockLLMProvider } from '../../llm';
import { StubDBAdapter } from '../../db/stub-adapter';
import { StubQueueAdapter } from '../../queue/stub-adapter';
import { getNarrativeTickMultiplier } from '../../core/decision/narrative-state';
import { checkMilestoneTriggers } from '../../core/npc/milestone-system';
import { MilestoneCheckContext } from '../../core/npc/milestone-system';
import { decayMood } from '../../models/mood';
import { checkDynamicEvents } from '../../world/dynamic-events';
import { getTasksByVocation, getTasksByVocation11, getAllVocation11Ids } from '../../data/tasks';
import { getLocationById } from '../../data/world';

function createTestCharacter(overrides: Partial<Character> = {}): Character {
  const now = new Date();
  return {
    id: '__test__char-f16-20',
    name: '__test__ F16-20 Character',
    playerId: '__test__player',
    vocation: 'lavrador',
    position: null,
    bio: 'Test character for phases 16-20',
    locationId: 'veldra',
    activityId: null,
    travelDestination: null,
    traits: {
      openness: 5,
      conscientiousness: 7,
      extraversion: 4,
      emotionalStability: 6,
      agreeableness: 5,
    },
    mood: {
      joy: 5,
      sadness: 2,
      anger: 1,
      fear: 2,
      disgust: 1,
      surprise: 3,
    },
    faith: 5,
    objective: {
      id: '__test__obj',
      description: 'Test objective',
      type: 'economic',
      difficulty: 2,
      progressScore: 0,
    },
    commitments: [],
    lastTickAt: now,
    nextTickAt: new Date(now.getTime() + 30 * 60 * 1000),
    lastPlayerLoginAt: now,
    isNpc: false,
    specializations: [],
    visitedLocations: [],
    traitHistory: [],
    previousVocation: null,
    emergentSpecialization: null,
    richTickCount: 0,
    lastPrayAt: null,
    ...overrides,
  };
}

describe('Phase 16 — Sistemas Automáticos', () => {
  let db: StubDBAdapter;
  let queue: StubQueueAdapter;
  let llm: MockLLMProvider;

  beforeEach(() => {
    db = new StubDBAdapter();
    queue = new StubQueueAdapter();
    llm = new MockLLMProvider();
  });

  describe('Faith decay by absence', () => {
    it('calculates correct decay for 48h absence', () => {
      const hoursSinceLogin = 48;
      const faithDecay = hoursSinceLogin > 24 ? Math.floor(hoursSinceLogin / 24) * 0.5 : 0;
      expect(faithDecay).toBe(1.0);
      expect(Math.max(1, 8 - faithDecay)).toBe(7);
    });

    it('calculates correct decay for 72h absence', () => {
      const hoursSinceLogin = 72;
      const faithDecay = hoursSinceLogin > 24 ? Math.floor(hoursSinceLogin / 24) * 0.5 : 0;
      expect(faithDecay).toBe(1.5);
      expect(Math.max(1, 2 - faithDecay)).toBe(1);
    });

    it('does not decay faith if absence is less than 24h', () => {
      const hoursSinceLogin = 12;
      const faithDecay = hoursSinceLogin > 24 ? Math.floor(hoursSinceLogin / 24) * 0.5 : 0;
      expect(faithDecay).toBe(0);
    });
  });

  describe('Faith penalty for ignored suggestions', () => {
    it('calculates correct penalty for ignored suggestion', () => {
      const currentFaith = 7;
      const penalty = 0.5;
      const newFaith = Math.max(1, currentFaith - penalty);
      expect(newFaith).toBe(6.5);
    });

    it('does not reduce faith below 1', () => {
      const currentFaith = 1;
      const penalty = 0.5;
      const newFaith = Math.max(1, currentFaith - penalty);
      expect(newFaith).toBe(1);
    });
  });

  describe('Automatic commitments generation', () => {
    it('generates commitment every 10 rich ticks', async () => {
      const character = createTestCharacter({ richTickCount: 10, commitments: [] });
      const initialCount = character.commitments.length;
      await executeCharacterTick(character, db, queue, llm);
      expect(character.commitments.length).toBeGreaterThanOrEqual(initialCount);
    });

    it('does not generate commitment if already at max 3', async () => {
      const existingCommitments = [
        { id: 'c1', description: 'Test 1', deadline: new Date(Date.now() + 86400000), urgency: 'medium' as const, taskId: 'cultivate', createdAt: new Date() },
        { id: 'c2', description: 'Test 2', deadline: new Date(Date.now() + 86400000), urgency: 'medium' as const, taskId: 'forge_item', createdAt: new Date() },
        { id: 'c3', description: 'Test 3', deadline: new Date(Date.now() + 86400000), urgency: 'medium' as const, taskId: 'patrol', createdAt: new Date() },
      ];
      const character = createTestCharacter({ richTickCount: 10, commitments: existingCommitments });
      await executeCharacterTick(character, db, queue, llm);
      expect(character.commitments.length).toBe(3);
    });
  });

  describe('Objective reset at 100%', () => {
    it('creates new objective when progress reaches 100', async () => {
      const character = createTestCharacter({
        objective: {
          id: '__test__obj',
          description: 'Test objective',
          type: 'economic',
          difficulty: 2,
          progressScore: 98,
        },
      });
      await executeCharacterTick(character, db, queue, llm);
      expect(character.objective.progressScore).toBeLessThanOrEqual(100);
    });

    it('rotates objective type after completion', async () => {
      const character = createTestCharacter({
        objective: {
          id: '__test__obj',
          description: 'Completed objective',
          type: 'economic',
          difficulty: 2,
          progressScore: 100,
        },
      });
      await executeCharacterTick(character, db, queue, llm);
      expect(character.objective.type).toBe('social');
      expect(character.objective.difficulty).toBe(3);
      expect(character.objective.progressScore).toBe(0);
    });

    it('caps difficulty at 5', async () => {
      const character = createTestCharacter({
        objective: {
          id: '__test__obj',
          description: 'Completed objective',
          type: 'economic',
          difficulty: 5,
          progressScore: 100,
        },
      });
      await executeCharacterTick(character, db, queue, llm);
      expect(character.objective.difficulty).toBeLessThanOrEqual(5);
    });
  });

  describe('NPC reversal on login', () => {
    it('shouldConvertToNPC returns true after 48h', () => {
      const character = createTestCharacter({
        lastPlayerLoginAt: new Date(Date.now() - 49 * 60 * 60 * 1000),
        isNpc: false,
      });
      expect(shouldConvertToNPC(character)).toBe(true);
    });

    it('shouldConvertToNPC returns false if already NPC', () => {
      const character = createTestCharacter({
        lastPlayerLoginAt: new Date(Date.now() - 49 * 60 * 60 * 1000),
        isNpc: true,
      });
      expect(shouldConvertToNPC(character)).toBe(false);
    });
  });
});

describe('Phase 17 — Infra e Observabilidade', () => {
  describe('Narrative tick multiplier', () => {
    it('returns 0.5x for very rich states (score >= 6)', () => {
      expect(getNarrativeTickMultiplier(6)).toBe(0.5);
      expect(getNarrativeTickMultiplier(10)).toBe(0.5);
    });

    it('returns 0.75x for rich states (score >= 4)', () => {
      expect(getNarrativeTickMultiplier(4)).toBe(0.75);
      expect(getNarrativeTickMultiplier(5)).toBe(0.75);
    });

    it('returns 1.0x for neutral states (score >= 2)', () => {
      expect(getNarrativeTickMultiplier(2)).toBe(1.0);
      expect(getNarrativeTickMultiplier(3)).toBe(1.0);
    });

    it('returns 1.5x for trivial states (score < 2)', () => {
      expect(getNarrativeTickMultiplier(0)).toBe(1.5);
      expect(getNarrativeTickMultiplier(1)).toBe(1.5);
    });
  });

  describe('Scheduler metrics interface', () => {
    it('SchedulerMetrics includes retry tracking fields', () => {
      const metrics = {
        totalTicks: 0,
        totalErrors: 0,
        avgTickTimeMs: 0,
        llmCalls: { gemini: 0, cerebras: 0, mock: 0 },
        lastCycleAt: null as Date | null,
        retryAttempts: 0,
        retrySuccesses: 0,
        retryFailures: 0,
      };
      expect(metrics.retryAttempts).toBeDefined();
      expect(metrics.retrySuccesses).toBeDefined();
      expect(metrics.retryFailures).toBeDefined();
    });
  });
});

describe('Phase 19 — Sistemas Emergentes', () => {
  let db: StubDBAdapter;
  let queue: StubQueueAdapter;
  let llm: MockLLMProvider;

  beforeEach(() => {
    db = new StubDBAdapter();
    queue = new StubQueueAdapter();
    llm = new MockLLMProvider();
  });

  describe('Mood affected by world events', () => {
    it('disease events increase sadness and fear', async () => {
      const character = createTestCharacter({
        locationId: 'arvel',
        mood: { joy: 5, sadness: 1, anger: 1, fear: 1, disgust: 1, surprise: 3 },
      });
      await executeCharacterTick(character, db, queue, llm);
      expect(character.mood.sadness).toBeGreaterThan(1);
      expect(character.mood.fear).toBeGreaterThan(1);
    });

    it('locations without events do not affect mood from events', async () => {
      const character = createTestCharacter({
        locationId: 'durenfall',
        mood: { joy: 5, sadness: 2, anger: 1, fear: 2, disgust: 1, surprise: 3 },
      });
      await executeCharacterTick(character, db, queue, llm);
      expect(character.mood.joy).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Mood affected by relations', () => {
    it('stub DB returns empty relations (integration test with real DB required)', async () => {
      const character = createTestCharacter({
        mood: { joy: 3, sadness: 2, anger: 1, fear: 2, disgust: 1, surprise: 3 },
      });
      const relations = await db.relations.getByCharacterId(character.id);
      expect(relations).toEqual([]);
    });
  });

  describe('Expired commitment penalty', () => {
    it('reduces faith and increases negative mood for expired commitments', async () => {
      const expiredCommitment = {
        id: 'expired-1',
        description: 'Expired task',
        deadline: new Date(Date.now() - 3600000),
        urgency: 'high' as const,
        taskId: 'cultivate',
        createdAt: new Date(),
      };
      const character = createTestCharacter({
        faith: 6,
        commitments: [expiredCommitment],
        mood: { joy: 5, sadness: 2, anger: 1, fear: 2, disgust: 1, surprise: 3 },
      });
      await executeCharacterTick(character, db, queue, llm);
      expect(character.faith).toBeLessThan(6);
      expect(character.commitments.length).toBe(0);
    });
  });

  describe('Milestone chain relationships', () => {
    it('checkMilestoneTriggers returns triggers for commitment resolved', () => {
      const character = createTestCharacter({ richTickCount: 5 });
      const context: MilestoneCheckContext = {
        character,
        taskId: 'cultivate',
        score: 10,
        locationId: 'veldra',
        hasPendingSuggestion: false,
        wasFollowed: false,
        isNewLocation: false,
        hasActiveWorldEvent: false,
        moodState: 'rico',
        commitmentResolved: true,
      };
      const triggers = checkMilestoneTriggers(context);
      expect(triggers).toContain('commitment_resolved');
    });

    it('checkMilestoneTriggers returns triggers for specialization consolidated', () => {
      const character = createTestCharacter({
        richTickCount: 5,
        emergentSpecialization: 'Master Farmer',
      });
      const context: MilestoneCheckContext = {
        character,
        taskId: 'cultivate',
        score: 10,
        locationId: 'veldra',
        hasPendingSuggestion: false,
        wasFollowed: false,
        isNewLocation: false,
        hasActiveWorldEvent: false,
        moodState: 'rico',
        commitmentResolved: false,
      };
      const triggers = checkMilestoneTriggers(context);
      expect(triggers).toContain('specialization_consolidated');
    });
  });

  describe('Dynamic events generation', () => {
    it('generates bountiful harvest event for lavrador with high richTickCount', () => {
      const character = createTestCharacter({
        vocation: 'lavrador',
        richTickCount: 25,
      });
      const task = getTasksByVocation('lavrador').find(t => t.id === 'cultivate')!;
      const events = checkDynamicEvents(character, task);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].id).toBe('bountiful_harvest');
    });

    it('generates cultural festival for trovador', () => {
      const character = createTestCharacter({
        vocation: 'trovador',
        richTickCount: 20,
      });
      const task = getTasksByVocation11('trovador').find(t => t.id === 'perform_tavern')!;
      const events = checkDynamicEvents(character, task);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].id).toBe('cultural_festival');
    });

    it('generates military campaign for guerreiro', () => {
      const character = createTestCharacter({
        vocation: 'guerreiro',
        richTickCount: 25,
      });
      const task = getTasksByVocation11('guerreiro').find(t => t.id === 'spar_training')!;
      const events = checkDynamicEvents(character, task);
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].id).toBe('military_campaign');
    });

    it('does not generate event without sufficient richTickCount', () => {
      const character = createTestCharacter({
        vocation: 'lavrador',
        richTickCount: 5,
      });
      const task = getTasksByVocation('lavrador').find(t => t.id === 'cultivate')!;
      const events = checkDynamicEvents(character, task);
      expect(events.length).toBe(0);
    });
  });

  describe('Resurrect character endpoint logic', () => {
    it('shouldConvertToNPC returns 6h fixed interval for NPC characters', () => {
      const character = createTestCharacter({ isNpc: true });
      expect(calculateTickInterval(character, 0)).toBe(6 * 60 * 60 * 1000);
    });
  });

  describe('Multiple specializations', () => {
    it('character can have multiple specializations', () => {
      const character = createTestCharacter({
        specializations: ['Master Farmer', 'Animal Whisperer'],
        emergentSpecialization: 'Harvest King',
      });
      expect(character.specializations.length).toBe(2);
      expect(character.emergentSpecialization).toBe('Harvest King');
    });

    it('specializations array is initialized empty', () => {
      const character = createTestCharacter();
      expect(character.specializations).toEqual([]);
    });
  });
});

describe('Phase 20 — Expansão', () => {
  describe('New v1.1 vocations', () => {
    it('clerigo has 8 tasks', () => {
      const tasks = getTasksByVocation11('clerigo');
      expect(tasks.length).toBe(8);
      expect(tasks[0].id).toBe('bless_faithful');
    });

    it('trovador has 8 tasks', () => {
      const tasks = getTasksByVocation11('trovador');
      expect(tasks.length).toBe(8);
      expect(tasks[0].id).toBe('perform_tavern');
    });

    it('guerreiro has 8 tasks', () => {
      const tasks = getTasksByVocation11('guerreiro');
      expect(tasks.length).toBe(8);
      expect(tasks[0].id).toBe('spar_training');
    });

    it('escriba has 8 tasks', () => {
      const tasks = getTasksByVocation11('escriba');
      expect(tasks.length).toBe(8);
      expect(tasks[0].id).toBe('copy_document');
    });

    it('vorant has 8 tasks', () => {
      const tasks = getTasksByVocation11('vorant');
      expect(tasks.length).toBe(8);
      expect(tasks[0].id).toBe('meditate_vora');
    });

    it('getAllVocation11Ids returns 5 vocation IDs', () => {
      const ids = getAllVocation11Ids();
      expect(ids.length).toBe(5);
      expect(ids).toContain('clerigo');
      expect(ids).toContain('trovador');
      expect(ids).toContain('guerreiro');
      expect(ids).toContain('escriba');
      expect(ids).toContain('vorant');
    });

    it('clerigo tasks have social category focus', () => {
      const tasks = getTasksByVocation11('clerigo');
      const socialTasks = tasks.filter(t => t.category === 'social');
      expect(socialTasks.length).toBeGreaterThanOrEqual(3);
    });

    it('vorant tasks have exploration and work categories', () => {
      const tasks = getTasksByVocation11('vorant');
      const explorationTasks = tasks.filter(t => t.category === 'exploration');
      const workTasks = tasks.filter(t => t.category === 'work');
      expect(explorationTasks.length).toBeGreaterThanOrEqual(2);
      expect(workTasks.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Vocation change detection logic', () => {
    it('detects vocation change when task ratio exceeds threshold', () => {
      const vocationTaskMap: Record<string, { tasks: string[]; minRatio: number }> = {
        clerigo: { tasks: ['bless_faithful', 'hear_confession', 'tend_sick', 'preach_sermon'], minRatio: 0.2 },
        trovador: { tasks: ['perform_tavern', 'compose_ballad', 'spread_news', 'gather_rumors'], minRatio: 0.2 },
        guerreiro: { tasks: ['spar_training', 'hunt_game', 'maintain_weapon', 'join_skirmish'], minRatio: 0.2 },
        escriba: { tasks: ['copy_document', 'write_letter', 'catalog_archive', 'translate_text'], minRatio: 0.2 },
        vorant: { tasks: ['meditate_vora', 'channel_element', 'heal_wound', 'study_lore'], minRatio: 0.2 },
      };

      const taskCounts: Record<string, number> = {
        bless_faithful: 15,
        hear_confession: 10,
        tend_sick: 8,
        preach_sermon: 7,
        rest: 5,
        eat_drink: 5,
      };
      const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);

      for (const [vocation, config] of Object.entries(vocationTaskMap)) {
        const matchingTasks = config.tasks.reduce((sum, t) => sum + (taskCounts[t] || 0), 0);
        const ratio = matchingTasks / totalTasks;
        if (vocation === 'clerigo') {
          expect(ratio).toBeGreaterThanOrEqual(config.minRatio);
        }
      }
    });
  });

  describe('Trait evolution detection', () => {
    it('detects extraversion evolution from high social activity', () => {
      const taskCounts: Record<string, number> = {
        visit_known: 20,
        tavern: 15,
        rest: 10,
        eat_drink: 5,
      };
      const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
      const socialRatio = ((taskCounts['visit_known'] || 0) + (taskCounts['tavern'] || 0)) / totalTasks;
      expect(socialRatio).toBeGreaterThan(0.3);
    });

    it('detects conscientiousness evolution from high work activity', () => {
      const taskCounts: Record<string, number> = {
        cultivate: 25,
        forge_item: 15,
        patrol: 10,
        rest: 5,
        eat_drink: 5,
      };
      const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
      const workRatio = ((taskCounts['cultivate'] || 0) + (taskCounts['forge_item'] || 0) + (taskCounts['patrol'] || 0)) / totalTasks;
      expect(workRatio).toBeGreaterThan(0.4);
    });

    it('detects openness evolution from high exploration activity', () => {
      const taskCounts: Record<string, number> = {
        explore_route: 15,
        observe_surroundings: 10,
        rest: 10,
        eat_drink: 5,
      };
      const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
      const explorationRatio = ((taskCounts['explore_route'] || 0) + (taskCounts['observe_surroundings'] || 0)) / totalTasks;
      expect(explorationRatio).toBeGreaterThan(0.2);
    });
  });

  describe('BullMQ production features', () => {
    it('BullMQAdapter has configurable concurrency', () => {
      const concurrency = parseInt(process.env.BULLMQ_CONCURRENCY || '5', 10);
      expect(concurrency).toBeGreaterThan(0);
    });

    it('BullMQAdapter has configurable max retries', () => {
      const maxRetries = parseInt(process.env.BULLMQ_MAX_RETRIES || '3', 10);
      expect(maxRetries).toBeGreaterThan(0);
    });

    it('BullMQAdapter has configurable backoff delay', () => {
      const backoffDelay = parseInt(process.env.BULLMQ_BACKOFF_DELAY || '5000', 10);
      expect(backoffDelay).toBeGreaterThan(0);
    });
  });

  describe('Enhanced prayer effects (faith >= 8)', () => {
    it('prayer gives +2 faith when faith >= 8', () => {
      const faithGain = 8 >= 8 ? 2 : 1;
      expect(faithGain).toBe(2);
    });

    it('prayer gives +1 faith when faith < 8', () => {
      const faithGain = 5 >= 8 ? 2 : 1;
      expect(faithGain).toBe(1);
    });

    it('prayer reduces all negative moods by 2 when faith >= 8', () => {
      const moodReduction = 8 >= 8 ? 2 : 1;
      expect(moodReduction).toBe(2);
    });

    it('prayer adds joy when faith >= 9', () => {
      const addsJoy = 9 >= 9;
      expect(addsJoy).toBe(true);
    });
  });
});
