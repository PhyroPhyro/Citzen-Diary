"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const npc_system_1 = require("../npc/npc-system");
(0, vitest_1.describe)('NPC System', () => {
    (0, vitest_1.describe)('generateNPCName', () => {
        (0, vitest_1.it)('generates a name with first and last', () => {
            const name = (0, npc_system_1.generateNPCName)();
            (0, vitest_1.expect)(name.firstName).toBeDefined();
            (0, vitest_1.expect)(name.lastName).toBeDefined();
            (0, vitest_1.expect)(name.fullName).toContain(' ');
        });
        (0, vitest_1.it)('generates different names on multiple calls', () => {
            const names = new Set();
            for (let i = 0; i < 20; i++) {
                names.add((0, npc_system_1.generateNPCName)().fullName);
            }
            (0, vitest_1.expect)(names.size).toBeGreaterThan(1);
        });
    });
    (0, vitest_1.describe)('generateDefaultProfile', () => {
        (0, vitest_1.it)('generates a profile with all fields', () => {
            const profile = (0, npc_system_1.generateDefaultProfile)({ locationId: 'veldra' });
            (0, vitest_1.expect)(profile.occupation).toBeDefined();
            (0, vitest_1.expect)(profile.dominantTrait).toBeDefined();
            (0, vitest_1.expect)(profile.physicalDescription).toBeDefined();
            (0, vitest_1.expect)(profile.firstImpression).toBeDefined();
        });
        (0, vitest_1.it)('uses trait bias when provided', () => {
            const profile = (0, npc_system_1.generateDefaultProfile)({
                locationId: 'veldra',
                traitBias: 'calmo',
            });
            (0, vitest_1.expect)(profile.dominantTrait).toBe('calmo');
        });
    });
    (0, vitest_1.describe)('shouldAutoNameNPC', () => {
        (0, vitest_1.it)('returns false if NPC is named by player', () => {
            const npc = {
                isNamedByPlayer: true,
                createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
            };
            (0, vitest_1.expect)((0, npc_system_1.shouldAutoNameNPC)(npc)).toBe(false);
        });
        (0, vitest_1.it)('returns false if NPC is less than 24h old', () => {
            const npc = {
                isNamedByPlayer: false,
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
            };
            (0, vitest_1.expect)((0, npc_system_1.shouldAutoNameNPC)(npc)).toBe(false);
        });
        (0, vitest_1.it)('returns true if NPC is 24h+ old and not named', () => {
            const npc = {
                isNamedByPlayer: false,
                createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
            };
            (0, vitest_1.expect)((0, npc_system_1.shouldAutoNameNPC)(npc)).toBe(true);
        });
    });
    (0, vitest_1.describe)('autoNameNPC', () => {
        (0, vitest_1.it)('returns existing name if already named by player', () => {
            const npc = {
                name: 'Aldric',
                isNamedByPlayer: true,
            };
            (0, vitest_1.expect)((0, npc_system_1.autoNameNPC)(npc)).toBe('Aldric');
        });
        (0, vitest_1.it)('generates a new name for unnamed NPC', () => {
            const npc = {
                name: 'Desconhecido',
                isNamedByPlayer: false,
            };
            const newName = (0, npc_system_1.autoNameNPC)(npc);
            (0, vitest_1.expect)(newName).not.toBe('Desconhecido');
            (0, vitest_1.expect)(newName).toContain(' ');
        });
    });
    (0, vitest_1.describe)('calculateAffinityDecay', () => {
        (0, vitest_1.it)('returns 0 for less than 24h', () => {
            (0, vitest_1.expect)((0, npc_system_1.calculateAffinityDecay)(12)).toBe(0);
        });
        (0, vitest_1.it)('returns -1 for 24-48h', () => {
            (0, vitest_1.expect)((0, npc_system_1.calculateAffinityDecay)(36)).toBe(-1);
        });
        (0, vitest_1.it)('returns -2 for 48-168h', () => {
            (0, vitest_1.expect)((0, npc_system_1.calculateAffinityDecay)(100)).toBe(-2);
        });
        (0, vitest_1.it)('returns -3 for 168h+', () => {
            (0, vitest_1.expect)((0, npc_system_1.calculateAffinityDecay)(200)).toBe(-3);
        });
    });
    (0, vitest_1.describe)('applyAffinityDecay', () => {
        (0, vitest_1.it)('applies decay based on last interaction time', () => {
            const relation = {
                affinityScore: 50,
                lastInteractionAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
                memories: [],
            };
            const newAffinity = (0, npc_system_1.applyAffinityDecay)(relation);
            (0, vitest_1.expect)(newAffinity).toBe(49);
        });
        (0, vitest_1.it)('does not go below -100', () => {
            const relation = {
                affinityScore: -98,
                lastInteractionAt: new Date(Date.now() - 200 * 60 * 60 * 1000),
                memories: [],
            };
            const newAffinity = (0, npc_system_1.applyAffinityDecay)(relation);
            (0, vitest_1.expect)(newAffinity).toBe(-100);
        });
    });
    (0, vitest_1.describe)('addRelationMemory', () => {
        (0, vitest_1.it)('adds a memory to the relation', () => {
            const relation = {
                id: 'rel-1',
                characterId: 'char-1',
                targetId: 'npc-1',
                targetType: 'npc',
                targetName: 'Test NPC',
                relationType: 'conhecido',
                affinityScore: 0,
                firstMetAt: new Date(),
                firstMetLocationId: 'veldra',
                lastInteractionAt: new Date(),
                interactionCount: 0,
                memories: [],
            };
            const updated = (0, npc_system_1.addRelationMemory)(relation, {
                text: 'We met at the tavern',
                occurredAt: new Date(),
                locationId: 'tavern',
                taskId: 'talk',
            });
            (0, vitest_1.expect)(updated.memories.length).toBe(1);
            (0, vitest_1.expect)(updated.memories[0].text).toBe('We met at the tavern');
        });
    });
    (0, vitest_1.describe)('getRelationType', () => {
        (0, vitest_1.it)('returns amigo_proximo for high affinity', () => {
            (0, vitest_1.expect)((0, npc_system_1.getRelationType)(80)).toBe('amigo_proximo');
            (0, vitest_1.expect)((0, npc_system_1.getRelationType)(100)).toBe('amigo_proximo');
        });
        (0, vitest_1.it)('returns amigo for medium-high affinity', () => {
            (0, vitest_1.expect)((0, npc_system_1.getRelationType)(50)).toBe('amigo');
            (0, vitest_1.expect)((0, npc_system_1.getRelationType)(79)).toBe('amigo');
        });
        (0, vitest_1.it)('returns conhecido for positive affinity', () => {
            (0, vitest_1.expect)((0, npc_system_1.getRelationType)(20)).toBe('conhecido');
            (0, vitest_1.expect)((0, npc_system_1.getRelationType)(49)).toBe('conhecido');
        });
        (0, vitest_1.it)('returns parceiro_trabalho for neutral', () => {
            (0, vitest_1.expect)((0, npc_system_1.getRelationType)(0)).toBe('parceiro_trabalho');
            (0, vitest_1.expect)((0, npc_system_1.getRelationType)(19)).toBe('parceiro_trabalho');
        });
        (0, vitest_1.it)('returns rival for negative affinity', () => {
            (0, vitest_1.expect)((0, npc_system_1.getRelationType)(-20)).toBe('rival');
            (0, vitest_1.expect)((0, npc_system_1.getRelationType)(-1)).toBe('rival');
        });
        (0, vitest_1.it)('returns inimigo for very negative affinity', () => {
            (0, vitest_1.expect)((0, npc_system_1.getRelationType)(-21)).toBe('inimigo');
            (0, vitest_1.expect)((0, npc_system_1.getRelationType)(-100)).toBe('inimigo');
        });
    });
});
//# sourceMappingURL=npc-system.test.js.map