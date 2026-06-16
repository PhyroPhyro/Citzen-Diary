"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAutonomyState = createAutonomyState;
exports.ensureNpcCharacters = ensureNpcCharacters;
exports.getNpcTickInterval = getNpcTickInterval;
exports.processNpcMood = processNpcMood;
exports.buildNpcRelationships = buildNpcRelationships;
exports.getDominantEmotion = getDominantEmotion;
exports.autoSpawnNpcs = autoSpawnNpcs;
const world_1 = require("../../data/world");
const npc_system_1 = require("./npc-system");
function createAutonomyState(npc, character) {
    return {
        id: `aut-${npc.id}`,
        npcId: npc.id,
        characterId: character.id,
        lastTickAt: character.lastTickAt,
        nextTickAt: character.nextTickAt,
        tickCount: 0,
        mood: { ...character.mood },
        faith: character.faith ?? 5,
        dominantEmotion: 'neutral',
        lastAction: '',
        locationId: npc.locationId,
        relationshipCount: 0,
        history: [],
    };
}
async function ensureNpcCharacters(db) {
    const npcs = await db.npcs.getAll();
    const characters = await db.character.getAllActive();
    const npcChars = characters.filter((c) => c.isNpc);
    for (const npc of npcs) {
        const exists = npcChars.find((c) => c.name === npc.name);
        if (!exists) {
            try {
                const traits = {
                    openness: 3 + Math.floor(Math.random() * 5),
                    conscientiousness: 3 + Math.floor(Math.random() * 5),
                    extraversion: 3 + Math.floor(Math.random() * 5),
                    emotionalStability: 3 + Math.floor(Math.random() * 5),
                    agreeableness: 3 + Math.floor(Math.random() * 5),
                };
                const mood = { joy: 5, sadness: 3, anger: 2, fear: 3, disgust: 2, surprise: 4 };
                const vocation = getVocationForOccupation(npc.occupation);
                const char = await db.character.create({
                    name: npc.name,
                    playerId: `npc-${npc.id}`,
                    vocation,
                    position: npc.occupation,
                    bio: `${npc.physicalDescription} ${npc.firstImpression}`,
                    locationId: npc.locationId,
                    isNpc: true,
                    traits,
                    mood,
                    faith: 5,
                    objective: { id: 'auto', description: 'Viver o dia a dia', type: 'survival', difficulty: 2, progressScore: 0 },
                    commitments: [],
                    lastTickAt: new Date(0),
                    nextTickAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
                    lastPlayerLoginAt: new Date(0),
                    emergentSpecialization: null,
                    specializations: [],
                    richTickCount: 0,
                    lastPrayAt: null,
                    visitedLocations: [npc.locationId],
                    traitHistory: [],
                    previousVocation: null,
                });
                console.log(`[NPC Autonomy] Created character for NPC ${npc.name} (vocation: ${vocation})`);
            }
            catch (e) {
                console.error(`[NPC Autonomy] Failed to create NPC character for ${npc.name}: ${e.message}`);
            }
        }
    }
}
function getVocationForOccupation(occupation) {
    const mapping = {
        'Ferreiro': 'aprendiz_de_artesao',
        'Curandeira': 'aprendiz_de_artesao',
        'Mercador': 'comerciante_ambulante',
        'Guarda': 'aspirante_a_guarda',
        'Pescador': 'lavrador',
        'Cozinheira': 'lavrador',
        'Tecelã': 'aprendiz_de_artesao',
        'Carteiro': 'andarilho',
        'Bibliotecário': 'aprendiz_de_artesao',
        'Taverneiro': 'comerciante_ambulante',
        'Lenhador': 'lavrador',
        'Pastor': 'lavrador',
        'Minerador': 'lavrador',
        'Escriba': 'andarilho',
        'Botânico': 'andarilho',
    };
    return mapping[occupation] || 'lavrador';
}
function getNpcTickInterval() {
    return 6 * 60 * 60 * 1000;
}
function processNpcMood(mood) {
    const drift = () => Math.random() * 0.6 - 0.3;
    return {
        joy: Math.max(0, Math.min(10, mood.joy + drift())),
        sadness: Math.max(0, Math.min(10, mood.sadness + drift())),
        anger: Math.max(0, Math.min(10, mood.anger + drift())),
        fear: Math.max(0, Math.min(10, mood.fear + drift())),
        disgust: Math.max(0, Math.min(10, mood.disgust + drift())),
        surprise: Math.max(0, Math.min(10, mood.surprise + drift())),
    };
}
async function buildNpcRelationships(characterId, locationId, db, characters) {
    const othersAtLocation = characters.filter((c) => c.locationId === locationId && c.id !== characterId);
    for (const other of othersAtLocation) {
        const existing = await db.relations.getByTarget(characterId, other.id);
        if (existing) {
            const daysSinceInteraction = (Date.now() - existing.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceInteraction < 1)
                continue;
            const affinityChange = Math.floor(Math.random() * 6) - 2;
            const newAffinity = Math.max(-100, Math.min(100, existing.affinityScore + affinityChange));
            const type = getNpcRelationType(newAffinity);
            await db.relations.update(existing.id, {
                affinityScore: newAffinity,
                relationType: type,
                lastInteractionAt: new Date(),
                interactionCount: existing.interactionCount + 1,
            });
        }
        else {
            await db.relations.create({
                characterId,
                targetId: other.id,
                targetType: other.isNpc ? 'npc' : 'player_character',
                targetName: other.name,
                relationType: 'conhecido',
                affinityScore: Math.floor(Math.random() * 40) - 10,
                firstMetAt: new Date(),
                firstMetLocationId: locationId,
                lastInteractionAt: new Date(),
                interactionCount: 1,
                memories: [],
            });
        }
    }
}
function getNpcRelationType(affinity) {
    if (affinity >= 80)
        return 'amigo_proximo';
    if (affinity >= 50)
        return 'amigo';
    if (affinity >= 20)
        return 'conhecido';
    if (affinity >= 0)
        return 'parceiro_trabalho';
    if (affinity >= -20)
        return 'rival';
    return 'inimigo';
}
function getDominantEmotion(mood) {
    const entries = Object.entries(mood);
    const max = entries.reduce((a, b) => (a[1] >= b[1] ? a : b));
    return max[0];
}
async function autoSpawnNpcs(db, llm, maxTotalNpcs = 20) {
    const npcs = await db.npcs.getAll();
    if (npcs.length >= maxTotalNpcs)
        return;
    const locations = world_1.LOCATIONS.filter((l) => l.type === 'village' || l.type === 'town');
    const npcsPerLocation = {};
    for (const n of npcs) {
        npcsPerLocation[n.locationId] = (npcsPerLocation[n.locationId] || 0) + 1;
    }
    for (const location of locations.slice(0, 3)) {
        const count = npcsPerLocation[location.id] || 0;
        if (count < 2 && npcs.length < maxTotalNpcs) {
            try {
                await (0, npc_system_1.createNPCForLocation)(location.id, db, llm);
                console.log(`[NPC Autonomy] Spawned NPC in ${location.name}`);
            }
            catch (e) {
                console.error(`[NPC Autonomy] Spawn failed for ${location.id}: ${e.message}`);
            }
        }
    }
}
//# sourceMappingURL=npc-autonomy.js.map