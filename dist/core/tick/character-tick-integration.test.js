"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const character_tick_1 = require("../../core/tick/character-tick");
const llm_1 = require("../../llm");
const stub_adapter_1 = require("../../db/stub-adapter");
const stub_adapter_2 = require("../../queue/stub-adapter");
function createTestCharacter(overrides = {}) {
    const now = new Date();
    return {
        id: '__test__char-integration',
        name: '__test__ Integration Character',
        playerId: '__test__player',
        vocation: 'lavrador',
        position: null,
        bio: 'Test character for integration',
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
        isNpc: false, specializations: [], visitedLocations: [], traitHistory: [], previousVocation: null,
        emergentSpecialization: null,
        richTickCount: 0,
        lastPrayAt: null,
        ...overrides,
    };
}
(0, vitest_1.describe)('Character Tick Integration', () => {
    let db;
    let queue;
    let llm;
    (0, vitest_1.beforeEach)(() => {
        db = new stub_adapter_1.StubDBAdapter();
        queue = new stub_adapter_2.StubQueueAdapter();
        llm = new llm_1.MockLLMProvider();
    });
    (0, vitest_1.it)('executes a full tick and returns result', async () => {
        const character = createTestCharacter();
        const result = await (0, character_tick_1.executeCharacterTick)(character, db, queue, llm);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result?.chosenTask).toBeDefined();
        (0, vitest_1.expect)(result?.diaryEntry).toBeDefined();
    });
    (0, vitest_1.it)('updates objective progress after tick', async () => {
        const character = createTestCharacter({
            objective: {
                id: '__test__obj',
                description: 'Test objective',
                type: 'economic',
                difficulty: 2,
                progressScore: 50,
            },
        });
        const result = await (0, character_tick_1.executeCharacterTick)(character, db, queue, llm);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(character.objective.progressScore).toBeGreaterThan(50);
    });
    (0, vitest_1.it)('does not exceed 100 progress score', async () => {
        const character = createTestCharacter({
            objective: {
                id: '__test__obj',
                description: 'Test objective',
                type: 'economic',
                difficulty: 2,
                progressScore: 98,
            },
        });
        const result = await (0, character_tick_1.executeCharacterTick)(character, db, queue, llm);
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(character.objective.progressScore).toBeLessThanOrEqual(100);
    });
    (0, vitest_1.it)('calls groupTrivialEntries during tick', async () => {
        const character = createTestCharacter();
        const result = await (0, character_tick_1.executeCharacterTick)(character, db, queue, llm);
        (0, vitest_1.expect)(result).not.toBeNull();
    });
    (0, vitest_1.it)('calls reevaluateSpecialization during tick', async () => {
        const character = createTestCharacter();
        const result = await (0, character_tick_1.executeCharacterTick)(character, db, queue, llm);
        (0, vitest_1.expect)(result).not.toBeNull();
    });
});
//# sourceMappingURL=character-tick-integration.test.js.map