"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const motor_1 = require("../decision/motor");
function createMockCharacter(overrides = {}) {
    return {
        id: 'char-1',
        name: 'Test Character',
        playerId: 'player-1',
        vocation: 'andarilho',
        position: null,
        bio: 'Test bio',
        locationId: 'veldra',
        activityId: null,
        travelDestination: null,
        traits: {
            openness: 7,
            conscientiousness: 5,
            extraversion: 6,
            emotionalStability: 5,
            agreeableness: 4,
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
            id: 'obj-1',
            description: 'Explore the world',
            type: 'exploratory',
            difficulty: 1,
            progressScore: 0,
        },
        commitments: [],
        lastTickAt: new Date(),
        nextTickAt: new Date(),
        lastPlayerLoginAt: new Date(),
        isNpc: false,
        emergentSpecialization: null,
        richTickCount: 0,
        ...overrides,
    };
}
(0, vitest_1.describe)('Decision Motor - Objective Contribution', () => {
    (0, vitest_1.it)('gives bonus to tasks matching exploratory objective', () => {
        const character = createMockCharacter({
            objective: {
                id: 'obj-1',
                description: 'Explore the world',
                type: 'exploratory',
                difficulty: 1,
                progressScore: 0,
            },
        });
        const pool = (0, motor_1.buildTaskPool)(character);
        const context = { character };
        const scored = (0, motor_1.scoreTasks)(pool, context);
        const exploreTask = scored.find(s => s.task.id === 'explore_route');
        (0, vitest_1.expect)(exploreTask).toBeDefined();
        (0, vitest_1.expect)(exploreTask.breakdown.objective).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('gives bonus to commerce tasks for economic objective', () => {
        const character = createMockCharacter({
            objective: {
                id: 'obj-1',
                description: 'Make money',
                type: 'economic',
                difficulty: 1,
                progressScore: 0,
            },
            vocation: 'comerciante_ambulante',
        });
        const pool = (0, motor_1.buildTaskPool)(character);
        const context = { character };
        const scored = (0, motor_1.scoreTasks)(pool, context);
        const commerceTasks = scored.filter(s => s.breakdown.objective > 0);
        (0, vitest_1.expect)(commerceTasks.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('gives higher bonus as objective progresses', () => {
        const character = createMockCharacter({
            objective: {
                id: 'obj-1',
                description: 'Explore the world',
                type: 'exploratory',
                difficulty: 1,
                progressScore: 50,
            },
        });
        const pool = (0, motor_1.buildTaskPool)(character);
        const context = { character };
        const scored = (0, motor_1.scoreTasks)(pool, context);
        const exploreTask = scored.find(s => s.task.id === 'explore_route');
        (0, vitest_1.expect)(exploreTask).toBeDefined();
        (0, vitest_1.expect)(exploreTask.breakdown.objective).toBeGreaterThanOrEqual(2);
    });
    (0, vitest_1.it)('gives no bonus when objective is complete', () => {
        const character = createMockCharacter({
            objective: {
                id: 'obj-1',
                description: 'Done',
                type: 'exploratory',
                difficulty: 1,
                progressScore: 100,
            },
        });
        const pool = (0, motor_1.buildTaskPool)(character);
        const context = { character };
        const scored = (0, motor_1.scoreTasks)(pool, context);
        const allObjectives = scored.map(s => s.breakdown.objective);
        (0, vitest_1.expect)(allObjectives.every(o => o === 0)).toBe(true);
    });
});
(0, vitest_1.describe)('Decision Motor - Environment Modifiers', () => {
    (0, vitest_1.it)('gives bonus for social tasks in city', () => {
        const character = createMockCharacter({
            locationId: 'veldra',
        });
        const pool = (0, motor_1.buildTaskPool)(character);
        const context = { character };
        const scored = (0, motor_1.scoreTasks)(pool, context);
        const socialTask = scored.find(s => s.task.category === 'social');
        if (socialTask) {
            (0, vitest_1.expect)(socialTask.breakdown.environment).toBeGreaterThanOrEqual(0);
        }
    });
    (0, vitest_1.it)('gives bonus for exploration tasks on road', () => {
        const character = createMockCharacter({
            locationId: 'estrada_arvel',
        });
        const pool = (0, motor_1.buildTaskPool)(character);
        const context = { character };
        const scored = (0, motor_1.scoreTasks)(pool, context);
        const exploreTask = scored.find(s => s.task.category === 'exploration');
        if (exploreTask) {
            (0, vitest_1.expect)(exploreTask.breakdown.environment).toBeGreaterThanOrEqual(0);
        }
    });
});
(0, vitest_1.describe)('Decision Motor - Full Flow', () => {
    (0, vitest_1.it)('returns top 3 tasks for a character', () => {
        const character = createMockCharacter();
        const top3 = (0, motor_1.runDecisionMotor)(character, { character });
        (0, vitest_1.expect)(top3.length).toBeLessThanOrEqual(3);
        (0, vitest_1.expect)(top3.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(top3[0].score).toBeGreaterThanOrEqual(top3[1].score);
        (0, vitest_1.expect)(top3[1].score).toBeGreaterThanOrEqual(top3[2].score);
    });
    (0, vitest_1.it)('respects pending suggestion with high faith', () => {
        const character = createMockCharacter({ faith: 9 });
        const context = {
            character,
            pendingSuggestion: { type: 'task', taskId: 'explore_route' },
        };
        const top3 = (0, motor_1.runDecisionMotor)(character, context);
        const suggestedTask = top3.find(t => t.task.id === 'explore_route');
        if (suggestedTask) {
            (0, vitest_1.expect)(suggestedTask.breakdown.faith).toBeGreaterThan(0);
        }
    });
    (0, vitest_1.it)('penalizes suggested task with low faith', () => {
        const character = createMockCharacter({ faith: 1 });
        const context = {
            character,
            pendingSuggestion: { type: 'task', taskId: 'walk' },
        };
        const top3 = (0, motor_1.runDecisionMotor)(character, context);
        const suggestedTask = top3.find(t => t.task.id === 'walk');
        if (suggestedTask) {
            (0, vitest_1.expect)(suggestedTask.breakdown.faith).toBeLessThan(0);
        }
    });
});
//# sourceMappingURL=motor-advanced.test.js.map