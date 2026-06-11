"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTickInterval = calculateTickInterval;
exports.shouldConvertToNPC = shouldConvertToNPC;
exports.executeCharacterTick = executeCharacterTick;
const decision_1 = require("../decision");
const narrative_state_1 = require("../decision/narrative-state");
const llm_context_1 = require("../../diary/llm-context");
const generator_1 = require("../../diary/generator");
const world_1 = require("../../data/world");
const milestone_system_1 = require("../npc/milestone-system");
const objective_1 = require("../../models/objective");
function calculateTickInterval(character) {
    const hoursSinceLogin = (Date.now() - character.lastPlayerLoginAt.getTime()) / (1000 * 60 * 60);
    let absenceInterval;
    if (hoursSinceLogin <= 3)
        absenceInterval = 30 * 60 * 1000;
    else if (hoursSinceLogin <= 6)
        absenceInterval = 60 * 60 * 1000;
    else if (hoursSinceLogin <= 9)
        absenceInterval = 2 * 60 * 60 * 1000;
    else if (hoursSinceLogin <= 12)
        absenceInterval = 3 * 60 * 60 * 1000;
    else if (hoursSinceLogin <= 24)
        absenceInterval = 4 * 60 * 60 * 1000;
    else if (hoursSinceLogin <= 48)
        absenceInterval = 5 * 60 * 60 * 1000;
    else
        return -1;
    if (character.isNpc)
        return -1;
    return absenceInterval;
}
function shouldConvertToNPC(character) {
    if (character.isNpc)
        return false;
    const hoursSinceLogin = (Date.now() - character.lastPlayerLoginAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceLogin > 48;
}
async function executeCharacterTick(character, db, queue, llm) {
    const interval = calculateTickInterval(character);
    if (interval === -1)
        return null;
    const pendingSuggestion = await db.suggestions.getPending(character.id);
    const context = {
        character,
        pendingSuggestion: pendingSuggestion
            ? {
                type: pendingSuggestion.action.type,
                taskId: pendingSuggestion.action.taskId,
                locationId: pendingSuggestion.action.locationId,
            }
            : undefined,
        activeCommitments: character.commitments.map((c) => ({
            taskId: c.id,
            ticksRemaining: Math.ceil((new Date(c.deadline).getTime() - Date.now()) / interval),
        })),
        relationsInLocation: [],
    };
    const top3 = (0, decision_1.runDecisionMotor)(character, context);
    if (top3.length === 0)
        return null;
    const chosen = top3[0];
    const task = chosen.task;
    const location = (0, world_1.getLocationById)(character.locationId);
    const activeEvents = location ? (0, world_1.getEventsByLocation)(character.locationId) : [];
    const narrativeState = (0, narrative_state_1.classifyNarrativeState)(task.id, chosen.score, chosen.breakdown.mood, {
        hasOtherCharacter: false,
        hasInteraction: task.category === 'social',
        hasCommitmentResolved: chosen.breakdown.commitment >= 3,
        hasMilestoneTriggered: false,
        hasPendingSuggestion: !!pendingSuggestion,
        objectiveProgressDelta: 0,
        isNewLocation: false,
        hasActiveWorldEvent: activeEvents.length > 0,
    });
    let diaryEntry = null;
    let milestone = null;
    if (narrativeState.isRich) {
        const llmContext = (0, llm_context_1.buildLLMContext)(character, chosen, narrativeState, location, activeEvents, []);
        const llmResult = await llm.generateDiaryEntry(llmContext);
        diaryEntry = {
            id: crypto.randomUUID(),
            characterId: character.id,
            text: llmResult.diary_entry,
            source: 'llm',
            occurredAt: new Date(),
            createdAt: new Date(),
            locationId: character.locationId,
            locationName: location?.name || 'Desconhecido',
            taskId: task.id,
            moodState: 'neutro',
            isGrouped: false,
            groupCount: null,
            isAnchored: false,
            milestoneId: null,
        };
        character.richTickCount = (character.richTickCount || 0) + 1;
    }
    else {
        diaryEntry = (0, generator_1.generateTemplateEntry)(character, task);
    }
    if (diaryEntry) {
        await db.diary.create(diaryEntry);
        await db.diary.enforceLimit(character.id, 30);
    }
    if (character.objective && character.objective.progressScore < 100) {
        const progressDelta = (0, objective_1.calculateObjectiveProgress)(task.id, character.objective.type);
        const newProgress = Math.min(100, character.objective.progressScore + progressDelta);
        await db.character.updateObjectiveProgress(character.id, newProgress);
        character.objective.progressScore = newProgress;
    }
    await (0, milestone_system_1.groupTrivialEntries)(character.id, db);
    await (0, milestone_system_1.reevaluateSpecialization)(character, db, llm);
    const milestoneContext = {
        character,
        taskId: task.id,
        score: chosen.score,
        locationId: character.locationId,
        hasPendingSuggestion: !!pendingSuggestion,
        wasFollowed: false,
        isNewLocation: false,
        hasActiveWorldEvent: activeEvents.length > 0,
        moodState: narrativeState.isRich ? 'rico' : 'trivial',
        commitmentResolved: chosen.breakdown.commitment >= 3,
    };
    const newMilestones = await (0, milestone_system_1.processMilestones)(milestoneContext, db, llm);
    if (newMilestones.length > 0) {
        const firstMilestone = newMilestones[0];
        milestone = firstMilestone;
        if (diaryEntry) {
            await db.diary.create({
                ...diaryEntry,
                milestoneId: firstMilestone.id,
                isAnchored: firstMilestone.importance !== 'minor',
            });
        }
    }
    if (pendingSuggestion) {
        const wasFollowed = pendingSuggestion.action.type === 'task' && pendingSuggestion.action.taskId === task.id;
        await db.suggestions.markProcessed(pendingSuggestion.id, wasFollowed);
    }
    const nextTickAt = new Date(Date.now() + interval);
    const characterUpdated = {
        lastTickAt: new Date(),
        nextTickAt,
        activityId: task.id,
        richTickCount: character.richTickCount,
    };
    await db.character.update(character.id, characterUpdated);
    await queue.scheduleNextTick(character.id, nextTickAt);
    return {
        characterId: character.id,
        chosenTask: chosen,
        narrativeState,
        diaryEntry,
        milestone,
        nextTickAt,
        characterUpdated,
    };
}
//# sourceMappingURL=character-tick.js.map