"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNearbyCharacters = findNearbyCharacters;
exports.createInteractionEvent = createInteractionEvent;
async function findNearbyCharacters(characterId, locationId, db) {
    const all = await db.character.getAllActive();
    return all.filter((c) => c.locationId === locationId && c.id !== characterId);
}
async function createInteractionEvent(character, nearby, db) {
    if (nearby.length === 0)
        return null;
    const target = nearby[Math.floor(Math.random() * nearby.length)];
    const isNpcInteraction = target.isNpc;
    const interactionTypes = ['meeting', 'conversation', 'trade', 'cooperation', 'shared_observation'];
    const affinityKey = getAffinityKey(character, target);
    let type;
    if (affinityKey > 50) {
        type = 'cooperation';
    }
    else if (affinityKey < -20) {
        type = 'conflict';
    }
    else {
        type = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
    }
    const descriptions = {
        meeting: `${character.name} encontra ${target.name} em ${getLocationName(character.locationId)}.`,
        conversation: `${character.name} e ${target.name} trocam algumas palavras.`,
        trade: `${character.name} negocia algo com ${target.name}.`,
        cooperation: `${character.name} ajuda ${target.name} com uma tarefa.`,
        conflict: `${character.name} e ${target.name} têm um desentendimento.`,
        shared_observation: `${character.name} e ${target.name} observam algo juntos.`,
    };
    const event = {
        id: `ce-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        participants: [character.id, target.id],
        locationId: character.locationId,
        description: descriptions[type],
        occurredAt: new Date(),
        outcomes: [
            {
                characterId: character.id,
                moodDelta: generateMoodDelta(type, isNpcInteraction),
                affinityDelta: type === 'conflict' ? -5 : type === 'cooperation' ? 5 : Math.floor(Math.random() * 4) - 1,
                narrative: `${character.name} ${getOutcomeNarrative(type, character, target)}`,
            },
            {
                characterId: target.id,
                moodDelta: generateMoodDelta(type, true),
                affinityDelta: type === 'conflict' ? -5 : type === 'cooperation' ? 5 : Math.floor(Math.random() * 4) - 1,
                narrative: `${target.name} ${getOutcomeNarrative(type, target, character)}`,
            },
        ],
    };
    await updateRelationsForEvent(event, db);
    return event;
}
function getAffinityKey(character, target) {
    // Simplified — no DB call needed for the initial heuristic
    return 0;
}
function getLocationName(locationId) {
    const names = {
        'veldra': 'Veldra',
        'ponte_veldra': 'Ponte de Veldra',
        'moinho_esquecido': 'Moinho Esquecido',
    };
    return names[locationId] || locationId;
}
function generateMoodDelta(type, isNpc) {
    const base = { joy: 0, sadness: 0, anger: 0, fear: 0, disgust: 0, surprise: 0 };
    switch (type) {
        case 'meeting':
        case 'conversation':
            base.joy = Math.floor(Math.random() * 3);
            base.surprise = Math.floor(Math.random() * 2);
            break;
        case 'cooperation':
            base.joy = Math.floor(Math.random() * 3) + 1;
            base.surprise = Math.floor(Math.random() * 2);
            break;
        case 'trade':
            base.joy = Math.floor(Math.random() * 2);
            break;
        case 'conflict':
            base.anger = Math.floor(Math.random() * 4) + 1;
            base.sadness = Math.floor(Math.random() * 3);
            break;
        case 'shared_observation':
            base.surprise = Math.floor(Math.random() * 4) + 1;
            base.joy = Math.floor(Math.random() * 2);
            break;
    }
    return base;
}
function getOutcomeNarrative(type, subject, object) {
    switch (type) {
        case 'meeting': return `encontra ${object.name} por acaso.`;
        case 'conversation': return `conversa brevemente com ${object.name}.`;
        case 'trade': return `faz uma pequena troca com ${object.name}.`;
        case 'cooperation': return `trabalha junto com ${object.name}.`;
        case 'conflict': return `discute com ${object.name}.`;
        case 'shared_observation': return `observa algo ao lado de ${object.name}.`;
        default: return `interage com ${object.name}.`;
    }
}
async function updateRelationsForEvent(event, db) {
    for (let i = 0; i < event.participants.length; i++) {
        for (let j = i + 1; j < event.participants.length; j++) {
            const aId = event.participants[i];
            const bId = event.participants[j];
            const outcomeA = event.outcomes[i];
            const outcomeB = event.outcomes[j];
            let rel = await db.relations.getByTarget(aId, bId);
            if (rel) {
                await db.relations.update(rel.id, {
                    affinityScore: Math.max(-100, Math.min(100, rel.affinityScore + outcomeA.affinityDelta)),
                    lastInteractionAt: event.occurredAt,
                    interactionCount: rel.interactionCount + 1,
                });
            }
            else {
                const bChar = await db.character.getById(bId);
                if (bChar) {
                    await db.relations.create({
                        characterId: aId,
                        targetId: bId,
                        targetType: bChar.isNpc ? 'npc' : 'player_character',
                        targetName: bChar.name,
                        relationType: 'conhecido',
                        affinityScore: outcomeA.affinityDelta,
                        firstMetAt: event.occurredAt,
                        firstMetLocationId: event.locationId,
                        lastInteractionAt: event.occurredAt,
                        interactionCount: 1,
                        memories: [],
                    });
                }
            }
        }
    }
}
//# sourceMappingURL=cross-character.js.map