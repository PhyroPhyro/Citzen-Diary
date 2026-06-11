"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const generator_1 = require("./generator");
function createTestCharacter() {
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
    };
}
(0, vitest_1.describe)('generateTemplateEntry', () => {
    (0, vitest_1.it)('generates a diary entry for a known task', () => {
        const character = createTestCharacter();
        const entry = (0, generator_1.generateTemplateEntry)(character, { id: 'cultivate', name: 'Cultivar / Plantar' });
        (0, vitest_1.expect)(entry.id).toBeDefined();
        (0, vitest_1.expect)(entry.characterId).toBe(character.id);
        (0, vitest_1.expect)(entry.text.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(entry.source).toBe('template');
        (0, vitest_1.expect)(entry.taskId).toBe('cultivate');
        (0, vitest_1.expect)(entry.isGrouped).toBe(false);
        (0, vitest_1.expect)(entry.groupCount).toBeNull();
        (0, vitest_1.expect)(entry.isAnchored).toBe(false);
    });
    (0, vitest_1.it)('generates a diary entry for an unknown task', () => {
        const character = createTestCharacter();
        const entry = (0, generator_1.generateTemplateEntry)(character, { id: 'unknown_task', name: 'Unknown Task' });
        (0, vitest_1.expect)(entry.text.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(entry.source).toBe('template');
    });
    (0, vitest_1.it)('includes positive suffix for happy mood', () => {
        const character = createTestCharacter();
        character.mood = { joy: 9, sadness: 1, anger: 1, fear: 1, disgust: 1, surprise: 1 };
        const entry = (0, generator_1.generateTemplateEntry)(character, { id: 'cultivate', name: 'Cultivar / Plantar' });
        (0, vitest_1.expect)(entry.moodState).toBe('animado');
    });
    (0, vitest_1.it)('includes negative suffix for sad mood', () => {
        const character = createTestCharacter();
        character.mood = { joy: 1, sadness: 9, anger: 1, fear: 1, disgust: 1, surprise: 1 };
        const entry = (0, generator_1.generateTemplateEntry)(character, { id: 'cultivate', name: 'Cultivar / Plantar' });
        (0, vitest_1.expect)(entry.moodState).toBe('melancolico');
    });
    (0, vitest_1.it)('generates entry for rest task', () => {
        const character = createTestCharacter();
        const entry = (0, generator_1.generateTemplateEntry)(character, { id: 'rest', name: 'Descansar' });
        (0, vitest_1.expect)(entry.text.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(entry.taskId).toBe('rest');
    });
    (0, vitest_1.it)('generates entry for travel task', () => {
        const character = createTestCharacter();
        const entry = (0, generator_1.generateTemplateEntry)(character, { id: 'deliver_message', name: 'Entregar Mensagem' });
        (0, vitest_1.expect)(entry.text.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(entry.taskId).toBe('deliver_message');
    });
});
//# sourceMappingURL=generator.test.js.map