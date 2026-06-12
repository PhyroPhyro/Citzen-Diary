import { describe, it, expect } from 'vitest';
import { buildTaskPool, scoreTasks, resolveTies, runDecisionMotor, DecisionContext } from './motor';
import { Character } from '../../models';
import { UNIVERSAL_TASKS, LAVRADOR_TASKS } from '../../data/tasks';

function createTestCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test-char-1',
    name: 'Test Character',
    playerId: 'player-1',
    vocation: 'lavrador',
    position: null,
    bio: 'A test character',
    locationId: 'veldra',
    activityId: null,
    travelDestination: null,
    traits: {
      openness: 5,
      conscientiousness: 8,
      extraversion: 3,
      emotionalStability: 6,
      agreeableness: 5,
    },
    mood: {
      joy: 7,
      sadness: 1,
      anger: 1,
      fear: 1,
      disgust: 1,
      surprise: 2,
    },
    faith: 5,
    objective: {
      id: 'obj-1',
      description: 'Test objective',
      type: 'economic',
      difficulty: 2,
      progressScore: 30,
    },
    commitments: [],
    lastTickAt: new Date(),
    nextTickAt: new Date(),
    lastPlayerLoginAt: new Date(),
    isNpc: false,
    emergentSpecialization: null,
    richTickCount: 0,
    lastPrayAt: null,
    ...overrides,
  };
}

describe('buildTaskPool', () => {
  it('includes universal tasks for all characters', () => {
    const character = createTestCharacter();
    const pool = buildTaskPool(character);
    const universalIds = UNIVERSAL_TASKS.map((t) => t.id);
    for (const id of universalIds) {
      expect(pool.find((t) => t.id === id)).toBeDefined();
    }
  });

  it('includes vocation-specific tasks', () => {
    const character = createTestCharacter({ vocation: 'lavrador' });
    const pool = buildTaskPool(character);
    expect(pool.find((t) => t.id === 'cultivate')).toBeDefined();
    expect(pool.find((t) => t.id === 'harvest_production')).toBeDefined();
  });

  it('filters to travel/rest tasks when character is traveling', () => {
    const character = createTestCharacter({ travelDestination: 'arvel' });
    const pool = buildTaskPool(character);
    // When traveling, only travel, rest, and needs tasks should be available
    const categories = pool.map((t) => t.category);
    for (const cat of categories) {
      expect(['travel', 'rest', 'needs']).toContain(cat);
    }
  });

  it('returns tasks for unknown location', () => {
    const character = createTestCharacter({ locationId: 'nonexistent' });
    const pool = buildTaskPool(character);
    expect(pool.length).toBeGreaterThan(0);
  });
});

describe('scoreTasks', () => {
  it('calculates scores for all tasks in pool', () => {
    const character = createTestCharacter();
    const pool = buildTaskPool(character);
    const context: DecisionContext = { character };
    const scored = scoreTasks(pool, context);
    expect(scored.length).toBe(pool.length);
  });

  it('higher conscientiousness boosts work tasks', () => {
    const highConsc = createTestCharacter({
      traits: { openness: 5, conscientiousness: 10, extraversion: 5, emotionalStability: 5, agreeableness: 5 },
    });
    const lowConsc = createTestCharacter({
      traits: { openness: 5, conscientiousness: 0, extraversion: 5, emotionalStability: 5, agreeableness: 5 },
    });

    const pool = buildTaskPool(highConsc);
    const cultivate = pool.find((t) => t.id === 'cultivate');
    expect(cultivate).toBeDefined();

    const scoredHigh = scoreTasks([cultivate!], { character: highConsc });
    const scoredLow = scoreTasks([cultivate!], { character: lowConsc });

    expect(scoredHigh[0].score).toBeGreaterThan(scoredLow[0].score);
  });

  it('includes score breakdown', () => {
    const character = createTestCharacter();
    const pool = buildTaskPool(character);
    const context: DecisionContext = { character };
    const scored = scoreTasks(pool, context);

    const first = scored[0];
    expect(first.breakdown.base).toBeDefined();
    expect(first.breakdown.traitPrimary).toBeDefined();
    expect(first.breakdown.mood).toBeDefined();
    expect(first.breakdown.objective).toBeDefined();
  });

  it('faith modifier boosts suggested task', () => {
    const character = createTestCharacter({ faith: 10 });
    const pool = buildTaskPool(character);
    const context: DecisionContext = {
      character,
      pendingSuggestion: { type: 'task', taskId: 'cultivate' },
    };
    const scored = scoreTasks(pool, context);
    const cultivate = scored.find((s) => s.task.id === 'cultivate');
    expect(cultivate).toBeDefined();
    expect(cultivate!.breakdown.faith).toBeGreaterThan(0);
  });

  it('low faith penalizes suggested task', () => {
    const character = createTestCharacter({ faith: 0 });
    const pool = buildTaskPool(character);
    const context: DecisionContext = {
      character,
      pendingSuggestion: { type: 'task', taskId: 'cultivate' },
    };
    const scored = scoreTasks(pool, context);
    const cultivate = scored.find((s) => s.task.id === 'cultivate');
    expect(cultivate).toBeDefined();
    expect(cultivate!.breakdown.faith).toBeLessThan(0);
  });
});

describe('resolveTies', () => {
  it('sorts by score descending (within tie threshold)', () => {
    const character = createTestCharacter();
    const pool = buildTaskPool(character);
    const scored = scoreTasks(pool, { character });
    const sorted = resolveTies(scored, character);

    // resolveTies only strictly sorts when diff > 1; within 1 point, tie-breaking applies
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = sorted[i].score - sorted[i + 1].score;
      expect(diff).toBeGreaterThanOrEqual(-1.01);
    }
  });

  it('commitment breaks ties', () => {
    const character = createTestCharacter();
    const scored = [
      { task: LAVRADOR_TASKS[0], score: 10, breakdown: { base: 5, traitPrimary: 2, traitSecondary: 0, mood: 1, objective: 0, commitment: 2, environment: 0, relation: 0, faith: 0 } },
      { task: LAVRADOR_TASKS[1], score: 10, breakdown: { base: 5, traitPrimary: 2, traitSecondary: 0, mood: 1, objective: 0, commitment: 0, environment: 0, relation: 0, faith: 0 } },
    ];
    const sorted = resolveTies(scored, character);
    expect(sorted[0].breakdown.commitment).toBeGreaterThan(sorted[1].breakdown.commitment);
  });
});

describe('runDecisionMotor', () => {
  it('returns top 3 tasks', () => {
    const character = createTestCharacter();
    const top3 = runDecisionMotor(character, { character });
    expect(top3.length).toBe(3);
  });

  it('tasks are sorted by score', () => {
    const character = createTestCharacter();
    const top3 = runDecisionMotor(character, { character });
    expect(top3[0].score).toBeGreaterThanOrEqual(top3[1].score);
    expect(top3[1].score).toBeGreaterThanOrEqual(top3[2].score);
  });
});
