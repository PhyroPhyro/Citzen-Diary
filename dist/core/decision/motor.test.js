"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const motor_1 = require("./motor");
const tasks_1 = require("../../data/tasks");
function createTestCharacter(overrides = {}) {
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
(0, vitest_1.describe)('buildTaskPool', () => {
    (0, vitest_1.it)('includes universal tasks for all characters', () => {
        const character = createTestCharacter();
        const pool = (0, motor_1.buildTaskPool)(character);
        const universalIds = tasks_1.UNIVERSAL_TASKS.map((t) => t.id);
        for (const id of universalIds) {
            (0, vitest_1.expect)(pool.find((t) => t.id === id)).toBeDefined();
        }
    });
    (0, vitest_1.it)('includes vocation-specific tasks', () => {
        const character = createTestCharacter({ vocation: 'lavrador' });
        const pool = (0, motor_1.buildTaskPool)(character);
        (0, vitest_1.expect)(pool.find((t) => t.id === 'cultivate')).toBeDefined();
        (0, vitest_1.expect)(pool.find((t) => t.id === 'harvest_production')).toBeDefined();
    });
    (0, vitest_1.it)('filters to travel/rest tasks when character is traveling', () => {
        const character = createTestCharacter({ travelDestination: 'arvel' });
        const pool = (0, motor_1.buildTaskPool)(character);
        // When traveling, only travel, rest, and needs tasks should be available
        const categories = pool.map((t) => t.category);
        for (const cat of categories) {
            (0, vitest_1.expect)(['travel', 'rest', 'needs']).toContain(cat);
        }
    });
    (0, vitest_1.it)('returns tasks for unknown location', () => {
        const character = createTestCharacter({ locationId: 'nonexistent' });
        const pool = (0, motor_1.buildTaskPool)(character);
        (0, vitest_1.expect)(pool.length).toBeGreaterThan(0);
    });
});
(0, vitest_1.describe)('scoreTasks', () => {
    (0, vitest_1.it)('calculates scores for all tasks in pool', () => {
        const character = createTestCharacter();
        const pool = (0, motor_1.buildTaskPool)(character);
        const context = { character };
        const scored = (0, motor_1.scoreTasks)(pool, context);
        (0, vitest_1.expect)(scored.length).toBe(pool.length);
    });
    (0, vitest_1.it)('higher conscientiousness boosts work tasks', () => {
        const highConsc = createTestCharacter({
            traits: { openness: 5, conscientiousness: 10, extraversion: 5, emotionalStability: 5, agreeableness: 5 },
        });
        const lowConsc = createTestCharacter({
            traits: { openness: 5, conscientiousness: 0, extraversion: 5, emotionalStability: 5, agreeableness: 5 },
        });
        const pool = (0, motor_1.buildTaskPool)(highConsc);
        const cultivate = pool.find((t) => t.id === 'cultivate');
        (0, vitest_1.expect)(cultivate).toBeDefined();
        const scoredHigh = (0, motor_1.scoreTasks)([cultivate], { character: highConsc });
        const scoredLow = (0, motor_1.scoreTasks)([cultivate], { character: lowConsc });
        (0, vitest_1.expect)(scoredHigh[0].score).toBeGreaterThan(scoredLow[0].score);
    });
    (0, vitest_1.it)('includes score breakdown', () => {
        const character = createTestCharacter();
        const pool = (0, motor_1.buildTaskPool)(character);
        const context = { character };
        const scored = (0, motor_1.scoreTasks)(pool, context);
        const first = scored[0];
        (0, vitest_1.expect)(first.breakdown.base).toBeDefined();
        (0, vitest_1.expect)(first.breakdown.traitPrimary).toBeDefined();
        (0, vitest_1.expect)(first.breakdown.mood).toBeDefined();
        (0, vitest_1.expect)(first.breakdown.objective).toBeDefined();
    });
    (0, vitest_1.it)('faith modifier boosts suggested task', () => {
        const character = createTestCharacter({ faith: 10 });
        const pool = (0, motor_1.buildTaskPool)(character);
        const context = {
            character,
            pendingSuggestion: { type: 'task', taskId: 'cultivate' },
        };
        const scored = (0, motor_1.scoreTasks)(pool, context);
        const cultivate = scored.find((s) => s.task.id === 'cultivate');
        (0, vitest_1.expect)(cultivate).toBeDefined();
        (0, vitest_1.expect)(cultivate.breakdown.faith).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('low faith penalizes suggested task', () => {
        const character = createTestCharacter({ faith: 0 });
        const pool = (0, motor_1.buildTaskPool)(character);
        const context = {
            character,
            pendingSuggestion: { type: 'task', taskId: 'cultivate' },
        };
        const scored = (0, motor_1.scoreTasks)(pool, context);
        const cultivate = scored.find((s) => s.task.id === 'cultivate');
        (0, vitest_1.expect)(cultivate).toBeDefined();
        (0, vitest_1.expect)(cultivate.breakdown.faith).toBeLessThan(0);
    });
});
(0, vitest_1.describe)('resolveTies', () => {
    (0, vitest_1.it)('sorts by score descending (within tie threshold)', () => {
        const character = createTestCharacter();
        const pool = (0, motor_1.buildTaskPool)(character);
        const scored = (0, motor_1.scoreTasks)(pool, { character });
        const sorted = (0, motor_1.resolveTies)(scored, character);
        // resolveTies only strictly sorts when diff > 1; within 1 point, tie-breaking applies
        for (let i = 0; i < sorted.length - 1; i++) {
            const diff = sorted[i].score - sorted[i + 1].score;
            (0, vitest_1.expect)(diff).toBeGreaterThanOrEqual(-1.01);
        }
    });
    (0, vitest_1.it)('commitment breaks ties', () => {
        const character = createTestCharacter();
        const scored = [
            { task: tasks_1.LAVRADOR_TASKS[0], score: 10, breakdown: { base: 5, traitPrimary: 2, traitSecondary: 0, mood: 1, objective: 0, commitment: 2, environment: 0, relation: 0, faith: 0 } },
            { task: tasks_1.LAVRADOR_TASKS[1], score: 10, breakdown: { base: 5, traitPrimary: 2, traitSecondary: 0, mood: 1, objective: 0, commitment: 0, environment: 0, relation: 0, faith: 0 } },
        ];
        const sorted = (0, motor_1.resolveTies)(scored, character);
        (0, vitest_1.expect)(sorted[0].breakdown.commitment).toBeGreaterThan(sorted[1].breakdown.commitment);
    });
});
(0, vitest_1.describe)('runDecisionMotor', () => {
    (0, vitest_1.it)('returns top 3 tasks', () => {
        const character = createTestCharacter();
        const top3 = (0, motor_1.runDecisionMotor)(character, { character });
        (0, vitest_1.expect)(top3.length).toBe(3);
    });
    (0, vitest_1.it)('tasks are sorted by score', () => {
        const character = createTestCharacter();
        const top3 = (0, motor_1.runDecisionMotor)(character, { character });
        (0, vitest_1.expect)(top3[0].score).toBeGreaterThanOrEqual(top3[1].score);
        (0, vitest_1.expect)(top3[1].score).toBeGreaterThanOrEqual(top3[2].score);
    });
});
//# sourceMappingURL=motor.test.js.map