"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNPCName = generateNPCName;
exports.generateDefaultProfile = generateDefaultProfile;
exports.generateNPCProfile = generateNPCProfile;
exports.createNPCForLocation = createNPCForLocation;
exports.shouldAutoNameNPC = shouldAutoNameNPC;
exports.autoNameNPC = autoNameNPC;
exports.calculateAffinityDecay = calculateAffinityDecay;
exports.applyAffinityDecay = applyAffinityDecay;
exports.addRelationMemory = addRelationMemory;
exports.getRelationType = getRelationType;
exports.processNPCDecay = processNPCDecay;
exports.processRelationDecay = processRelationDecay;
const world_1 = require("../../data/world");
const NPC_FIRST_NAMES = ['Aldric', 'Bram', 'Cedric', 'Doran', 'Eldrin', 'Finn', 'Garrick', 'Haldor', 'Ivar', 'Jorund', 'Kael', 'Leofric', 'Merrick', 'Nolan', 'Orin', 'Percival', 'Quentin', 'Roderick', 'Soren', 'Tobias', 'Ulric', 'Vance', 'Wulfric', 'Yorick', 'Zephyr'];
const NPC_LAST_NAMES = ['da Colina', 'do Valle', 'da Ponte', 'do Porto', 'da Serra', 'do Campo', 'da Mata', 'do Rio', 'da Pedra', 'do Trigo'];
const NPC_OCCUPATIONS = ['Ferreiro', 'Curandeira', 'Mercador', 'Guarda', 'Pescador', 'Cozinheira', 'Tecelã', 'Carteiro', 'Bibliotecário', 'Taverneiro', 'Lenhador', 'Pastor', 'Minerador', 'Escriba', 'Botânico'];
function generateNPCName() {
    const first = NPC_FIRST_NAMES[Math.floor(Math.random() * NPC_FIRST_NAMES.length)];
    const last = NPC_LAST_NAMES[Math.floor(Math.random() * NPC_LAST_NAMES.length)];
    return { firstName: first, lastName: last, fullName: `${first} ${last}` };
}
function generateDefaultProfile(context) {
    const occupation = NPC_OCCUPATIONS[Math.floor(Math.random() * NPC_OCCUPATIONS.length)];
    const traits = ['calmo', 'tagarela', 'desconfiado', 'amigável', 'reservado', 'enérgico', 'melancólico', 'otimista'];
    const dominantTrait = context.traitBias || traits[Math.floor(Math.random() * traits.length)];
    const descriptions = [
        'Figura de estatura média, com olhos atentos e mãos calejadas.',
        'Pessoa de sorriso fácil, vestes simples mas bem cuidadas.',
        'Indivíduo de postura ereta, olhar penetrante e voz firme.',
        'Figura curvada pelo tempo, mas com olhos ainda vivos.',
        'Pessoa de movimentos lentos mas deliberados, sempre observando.',
    ];
    const impressions = [
        'Parece alguém que conhece bem esta terra.',
        'Transmite uma sensação de confiança discreta.',
        'Tem algo de misterioso, mas não ameaçador.',
        'Parece estar sempre ocupado, mas disposto a conversar.',
        'Observa tudo com curiosidade silenciosa.',
    ];
    return {
        occupation,
        dominantTrait,
        physicalDescription: descriptions[Math.floor(Math.random() * descriptions.length)],
        firstImpression: impressions[Math.floor(Math.random() * impressions.length)],
    };
}
async function generateNPCProfile(llm, context) {
    const location = world_1.LOCATIONS.find((l) => l.id === context.locationId);
    const llmContext = `Location: ${location?.name || context.locationId}. Vocation context: ${context.vocation || 'unknown'}. Trait bias: ${context.traitBias || 'none'}. Generate a unique NPC profile.`;
    try {
        const result = await llm.generateNPCProfile(llmContext);
        return {
            occupation: result.occupation,
            dominantTrait: result.dominantTrait,
            physicalDescription: result.physicalDescription,
            firstImpression: result.firstImpression,
        };
    }
    catch {
        return generateDefaultProfile(context);
    }
}
async function createNPCForLocation(locationId, db, llm, context) {
    const profile = await generateNPCProfile(llm, {
        locationId,
        ...context,
    });
    const name = generateNPCName();
    return db.npcs.create({
        name: name.fullName,
        locationId,
        occupation: profile.occupation,
        dominantTrait: profile.dominantTrait,
        physicalDescription: profile.physicalDescription,
        firstImpression: profile.firstImpression,
    });
}
function shouldAutoNameNPC(npc) {
    if (npc.isNamedByPlayer)
        return false;
    const hoursSinceCreation = (Date.now() - npc.createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation >= 24;
}
function autoNameNPC(npc) {
    if (npc.isNamedByPlayer)
        return npc.name;
    const name = generateNPCName();
    return name.fullName;
}
function calculateAffinityDecay(hoursSinceInteraction) {
    if (hoursSinceInteraction < 24)
        return 0;
    if (hoursSinceInteraction < 48)
        return -1;
    if (hoursSinceInteraction < 168)
        return -2;
    return -3;
}
function applyAffinityDecay(relation) {
    const hoursSinceInteraction = (Date.now() - relation.lastInteractionAt.getTime()) / (1000 * 60 * 60);
    const decay = calculateAffinityDecay(hoursSinceInteraction);
    return Math.max(-100, relation.affinityScore + decay);
}
function addRelationMemory(relation, memory) {
    const newMemory = {
        id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        ...memory,
    };
    return {
        ...relation,
        memories: [...relation.memories, newMemory],
    };
}
function getRelationType(affinity) {
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
async function processNPCDecay(db) {
    const npcs = await db.npcs.getAll();
    for (const npc of npcs) {
        if (shouldAutoNameNPC(npc)) {
            const newName = autoNameNPC(npc);
            await db.npcs.update(npc.id, {
                name: newName,
                namedByPlayerId: 'system',
                namedByPlayerName: 'Sistema',
                namedAt: new Date(),
                isNamedByPlayer: true,
            });
        }
    }
}
async function processRelationDecay(db) {
    const characters = await db.character.getAllActive();
    for (const char of characters) {
        const relations = await db.relations.getByCharacterId(char.id);
        for (const relation of relations) {
            const newAffinity = applyAffinityDecay(relation);
            if (newAffinity !== relation.affinityScore) {
                const newType = getRelationType(newAffinity);
                await db.relations.update(relation.id, {
                    affinityScore: newAffinity,
                    relationType: newType,
                });
            }
        }
    }
}
//# sourceMappingURL=npc-system.js.map