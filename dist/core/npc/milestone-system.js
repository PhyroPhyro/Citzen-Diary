"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMilestoneTriggers = checkMilestoneTriggers;
exports.generateMilestone = generateMilestone;
exports.getMilestoneImportance = getMilestoneImportance;
exports.processMilestones = processMilestones;
exports.groupTrivialEntries = groupTrivialEntries;
exports.reevaluateSpecialization = reevaluateSpecialization;
const world_1 = require("../../data/world");
function checkMilestoneTriggers(context) {
    const triggers = [];
    const { character, taskId, locationId, isNewLocation, hasActiveWorldEvent, commitmentResolved } = context;
    if (isNewLocation) {
        const location = (0, world_1.getLocationById)(locationId);
        if (location?.population && location.population > 5000) {
            triggers.push('arrival_high_weight_location');
        }
        else {
            triggers.push('first_visit_new_location');
        }
    }
    if (commitmentResolved) {
        triggers.push('commitment_resolved');
    }
    if (character.richTickCount > 0 && character.richTickCount % 5 === 0) {
        triggers.push('specialization_consolidated');
    }
    if (hasActiveWorldEvent) {
        triggers.push('world_event_impact');
    }
    if (character.faith >= 8) {
        triggers.push('lasting_mood_change');
    }
    if (character.commitments && character.commitments.length > 0 && character.commitments.length === 1) {
        triggers.push('first_commitment');
    }
    if (character.emergentSpecialization) {
        triggers.push('specialization_consolidated');
    }
    return triggers;
}
async function generateMilestone(llm, trigger, character, locationId) {
    const location = (0, world_1.getLocationById)(locationId);
    const context = `Character: ${character.name}, Vocation: ${character.vocation}. Trigger: ${trigger}. Location: ${location?.name || locationId}. Bio: ${character.bio}`;
    try {
        return await llm.generateMilestone(context);
    }
    catch {
        const defaults = {
            position_gained: { title: 'Nova Posição', description: `${character.name} alcançou uma nova posição.` },
            position_lost: { title: 'Posição Perdida', description: `${character.name} perdeu uma posição que tinha.` },
            objective_achieved: { title: 'Objetivo Alcançado', description: `${character.name} completou um objetivo importante.` },
            relationship_established: { title: 'Nova Relação', description: `${character.name} formou um vínculo significativo.` },
            relationship_broken: { title: 'Relação Rompida', description: `${character.name} perdeu uma relação importante.` },
            trait_changed: { title: 'Mudança Interior', description: `${character.name} sentiu uma mudança em si mesmo.` },
            critical_survival: { title: 'Sobrevivência', description: `${character.name} passou por uma situação difícil.` },
            arrival_high_weight_location: { title: 'Chegada Importante', description: `${character.name} chegou a ${location?.name || 'um lugar significativo'}.` },
            commitment_resolved: { title: 'Compromisso Cumprido', description: `${character.name} resolveu um compromisso pendente.` },
            first_npc_interaction: { title: 'Primeiro Encontro', description: `${character.name} conheceu alguém novo.` },
            specialization_consolidated: { title: 'Especialização', description: `${character.name} consolidou sua especialização.` },
            world_event_impact: { title: 'Evento do Mundo', description: `${character.name} foi afetado por eventos maiores.` },
            lasting_mood_change: { title: 'Mudança de Humor', description: `${character.name} experimentou uma mudança emocional duradoura.` },
            arrival_medium_weight_location: { title: 'Nova Parada', description: `${character.name} chegou a um novo lugar.` },
            first_visit_new_location: { title: 'Primeira Visita', description: `${character.name} visitou um lugar pela primeira vez.` },
            first_exclusive_task: { title: 'Tarefa Exclusiva', description: `${character.name} realizou uma tarefa de sua vocação.` },
            small_economic_social_achievement: { title: 'Conquista', description: `${character.name} alcançou algo pequeno mas significativo.` },
            first_commitment: { title: 'Primeiro Compromisso', description: `${character.name} assumiu seu primeiro compromisso.` },
        };
        return defaults[trigger];
    }
}
function getMilestoneImportance(trigger) {
    const decisive = ['position_gained', 'position_lost', 'objective_achieved', 'relationship_broken', 'critical_survival'];
    const relevant = ['arrival_high_weight_location', 'commitment_resolved', 'specialization_consolidated', 'world_event_impact', 'lasting_mood_change'];
    if (decisive.includes(trigger))
        return 'decisive';
    if (relevant.includes(trigger))
        return 'relevant';
    return 'minor';
}
async function processMilestones(context, db, llm) {
    const triggers = checkMilestoneTriggers(context);
    if (triggers.length === 0)
        return [];
    const milestones = [];
    const location = (0, world_1.getLocationById)(context.locationId);
    const existingMilestones = await db.milestones.getByCharacterId(context.character.id);
    const activeMilestones = existingMilestones.filter((m) => m.isActiveContext);
    for (const trigger of triggers) {
        const milestoneData = await generateMilestone(llm, trigger, context.character, context.locationId);
        const importance = getMilestoneImportance(trigger);
        let parentMilestoneId = null;
        let chainOrder = 0;
        if (trigger === 'commitment_resolved') {
            const relatedCommitment = activeMilestones.find((m) => m.triggerType === 'first_commitment');
            if (relatedCommitment) {
                parentMilestoneId = relatedCommitment.id;
                chainOrder = relatedCommitment.chainOrder + 1;
            }
        }
        if (trigger === 'specialization_consolidated' && context.character.emergentSpecialization) {
            const relatedWork = activeMilestones.find((m) => m.triggerType === 'first_exclusive_task' || m.triggerType === 'small_economic_social_achievement');
            if (relatedWork) {
                parentMilestoneId = relatedWork.id;
                chainOrder = relatedWork.chainOrder + 1;
            }
        }
        const milestone = await db.milestones.create({
            characterId: context.character.id,
            importance,
            title: milestoneData.title,
            description: milestoneData.description,
            occurredAt: new Date(),
            locationId: context.locationId,
            locationName: location?.name || 'Desconhecido',
            triggerType: trigger,
            relatedCharacterIds: [],
            relatedEventId: null,
            diaryEntryId: null,
            isActiveContext: importance !== 'minor',
            parentMilestoneId,
            chainOrder,
        });
        milestones.push(milestone);
    }
    return milestones;
}
async function groupTrivialEntries(characterId, db) {
    const entries = await db.diary.getByCharacterId(characterId, 50);
    const templateEntries = entries.filter((e) => e.source === 'template' && !e.isGrouped);
    if (templateEntries.length < 3)
        return;
    const consecutiveGroups = [];
    let currentGroup = [templateEntries[0]];
    for (let i = 1; i < templateEntries.length; i++) {
        const prev = new Date(templateEntries[i - 1].occurredAt).getTime();
        const curr = new Date(templateEntries[i].occurredAt).getTime();
        const hoursDiff = (curr - prev) / (1000 * 60 * 60);
        if (hoursDiff <= 6) {
            currentGroup.push(templateEntries[i]);
        }
        else {
            if (currentGroup.length >= 3) {
                consecutiveGroups.push([...currentGroup]);
            }
            currentGroup = [templateEntries[i]];
        }
    }
    if (currentGroup.length >= 3) {
        consecutiveGroups.push([...currentGroup]);
    }
    for (const group of consecutiveGroups) {
        const firstEntry = group[group.length - 1];
        const lastEntry = group[0];
        await db.diary.create({
            characterId,
            text: `[${group.length} dias consecutivos] ${firstEntry.text}`,
            source: 'template',
            occurredAt: lastEntry.occurredAt,
            createdAt: new Date(),
            locationId: lastEntry.locationId,
            locationName: lastEntry.locationName,
            taskId: lastEntry.taskId,
            moodState: lastEntry.moodState,
            isGrouped: true,
            groupCount: group.length,
            isAnchored: false,
            milestoneId: null,
        });
        for (const entry of group) {
            await db.diary.create({
                ...entry,
                isGrouped: true,
                groupCount: group.length,
            });
        }
    }
}
async function reevaluateSpecialization(character, db, llm) {
    const entries = await db.diary.getByCharacterId(character.id, 100);
    const taskCounts = {};
    for (const entry of entries) {
        if (entry.taskId) {
            taskCounts[entry.taskId] = (taskCounts[entry.taskId] || 0) + 1;
        }
    }
    const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
    if (totalTasks < 20)
        return null;
    const topTask = Object.entries(taskCounts).sort((a, b) => b[1] - a[1])[0];
    if (!topTask)
        return null;
    const topTaskRatio = topTask[1] / totalTasks;
    if (topTaskRatio < 0.3)
        return null;
    const currentSpecializations = character.specializations || [];
    if (character.emergentSpecialization && !currentSpecializations.includes(character.emergentSpecialization)) {
        currentSpecializations.push(character.emergentSpecialization);
    }
    const context = `Character: ${character.name}, Vocation: ${character.vocation}. Most frequent task: ${topTask[0]} (${topTask[1]} times out of ${totalTasks}). Current specializations: ${currentSpecializations.join(', ') || 'none'}. Suggest a new specialization name.`;
    try {
        const result = await llm.generateSpecialization(context);
        const specialization = result.specialization;
        if (!currentSpecializations.includes(specialization)) {
            currentSpecializations.push(specialization);
        }
        const maxSpecializations = 3;
        if (currentSpecializations.length > maxSpecializations) {
            currentSpecializations.shift();
        }
        await db.character.update(character.id, {
            emergentSpecialization: specialization,
            specializations: currentSpecializations,
        });
        return specialization;
    }
    catch {
        const specialization = `Especialista em ${topTask[0].replace(/_/g, ' ')}`;
        if (!currentSpecializations.includes(specialization)) {
            currentSpecializations.push(specialization);
        }
        await db.character.update(character.id, {
            emergentSpecialization: specialization,
            specializations: currentSpecializations,
        });
        return specialization;
    }
}
//# sourceMappingURL=milestone-system.js.map