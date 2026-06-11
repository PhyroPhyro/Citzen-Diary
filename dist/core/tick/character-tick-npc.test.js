"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const character_tick_1 = require("./character-tick");
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
            openness: 5,
            conscientiousness: 5,
            extraversion: 5,
            emotionalStability: 5,
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
            id: 'obj-1',
            description: 'Test objective',
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
(0, vitest_1.describe)('Character Tick - NPC Conversion', () => {
    (0, vitest_1.describe)('shouldConvertToNPC', () => {
        (0, vitest_1.it)('returns false if less than 48h inactive', () => {
            const char = createMockCharacter({
                lastPlayerLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                isNpc: false,
            });
            (0, vitest_1.expect)((0, character_tick_1.shouldConvertToNPC)(char)).toBe(false);
        });
        (0, vitest_1.it)('returns false if already NPC', () => {
            const char = createMockCharacter({
                lastPlayerLoginAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
                isNpc: true,
            });
            (0, vitest_1.expect)((0, character_tick_1.shouldConvertToNPC)(char)).toBe(false);
        });
        (0, vitest_1.it)('returns true if more than 48h inactive and not NPC', () => {
            const char = createMockCharacter({
                lastPlayerLoginAt: new Date(Date.now() - 49 * 60 * 60 * 1000),
                isNpc: false,
            });
            (0, vitest_1.expect)((0, character_tick_1.shouldConvertToNPC)(char)).toBe(true);
        });
        (0, vitest_1.it)('returns false if exactly 48h inactive', () => {
            const char = createMockCharacter({
                lastPlayerLoginAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
                isNpc: false,
            });
            (0, vitest_1.expect)((0, character_tick_1.shouldConvertToNPC)(char)).toBe(false);
        });
    });
    (0, vitest_1.describe)('calculateTickInterval', () => {
        (0, vitest_1.it)('returns -1 for NPC characters', () => {
            const char = createMockCharacter({ isNpc: true });
            (0, vitest_1.expect)((0, character_tick_1.calculateTickInterval)(char)).toBe(-1);
        });
        (0, vitest_1.it)('returns -1 for characters inactive more than 48h', () => {
            const char = createMockCharacter({
                lastPlayerLoginAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
            });
            (0, vitest_1.expect)((0, character_tick_1.calculateTickInterval)(char)).toBe(-1);
        });
        (0, vitest_1.it)('returns 30min for active characters (<=3h)', () => {
            const char = createMockCharacter({
                lastPlayerLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            });
            (0, vitest_1.expect)((0, character_tick_1.calculateTickInterval)(char)).toBe(30 * 60 * 1000);
        });
        (0, vitest_1.it)('returns 5h for characters inactive 24-48h', () => {
            const char = createMockCharacter({
                lastPlayerLoginAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
            });
            (0, vitest_1.expect)((0, character_tick_1.calculateTickInterval)(char)).toBe(5 * 60 * 60 * 1000);
        });
    });
});
//# sourceMappingURL=character-tick-npc.test.js.map