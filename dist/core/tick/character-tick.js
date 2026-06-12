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
const websocket_1 = require("../../api/websocket");
const milestone_system_1 = require("../npc/milestone-system");
const objective_1 = require("../../models/objective");
const mood_1 = require("../../models/mood");
const dynamic_events_1 = require("../../world/dynamic-events");
function calculateTickInterval(character, lastRichnessScore = 0) {
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
    const narrativeMultiplier = (0, narrative_state_1.getNarrativeTickMultiplier)(lastRichnessScore);
    return Math.round(absenceInterval * narrativeMultiplier);
}
function shouldConvertToNPC(character) {
    if (character.isNpc)
        return false;
    const hoursSinceLogin = (Date.now() - character.lastPlayerLoginAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceLogin > 48;
}
async function executeCharacterTick(character, db, queue, llm) {
    const interval = calculateTickInterval(character, 0);
    if (interval === -1)
        return null;
    const pendingSuggestion = await db.suggestions.getPending(character.id);
    const activeMilestones = await db.milestones.getActiveContext(character.id);
    const relations = await db.relations.getByCharacterId(character.id);
    const activeEvents = (0, world_1.getEventsByLocation)(character.locationId);
    const relationsInLocation = relations
        .filter((r) => r.targetType === 'npc')
        .map((r) => ({ targetId: r.targetId, affinity: r.affinityScore }));
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
        relationsInLocation,
        activeMilestones,
        activeWorldEvents: activeEvents,
    };
    const top3 = (0, decision_1.runDecisionMotor)(character, context);
    if (top3.length === 0)
        return null;
    const chosen = top3[0];
    const task = chosen.task;
    const location = (0, world_1.getLocationById)(character.locationId);
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
    let milestoneId = null;
    let isAnchored = false;
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
        milestoneId = firstMilestone.id;
        isAnchored = firstMilestone.importance !== 'minor';
    }
    if (narrativeState.isRich) {
        const llmContext = (0, llm_context_1.buildLLMContext)(character, chosen, narrativeState, location, activeEvents, []);
        const llmResult = await llm.generateDiaryEntry(llmContext);
        const isCascade = llm.constructor.name === 'CascadeLLMProvider';
        const activeProvider = isCascade ? llm.activeProvider : llm.constructor.name;
        const isMock = activeProvider === 'mock' || activeProvider === 'MockLLMProvider';
        diaryEntry = {
            id: crypto.randomUUID(),
            characterId: character.id,
            text: llmResult.diary_entry,
            source: isMock ? 'mock' : 'llm',
            occurredAt: new Date(),
            createdAt: new Date(),
            locationId: character.locationId,
            locationName: location?.name || 'Desconhecido',
            taskId: task.id,
            moodState: 'neutro',
            isGrouped: false,
            groupCount: null,
            isAnchored,
            milestoneId,
        };
        character.richTickCount = (character.richTickCount || 0) + 1;
    }
    else {
        diaryEntry = (0, generator_1.generateTemplateEntry)(character, task);
        if (milestoneId) {
            diaryEntry.milestoneId = milestoneId;
            diaryEntry.isAnchored = isAnchored;
        }
    }
    if (diaryEntry) {
        await db.diary.create(diaryEntry);
        await db.diary.enforceLimit(character.id, 30);
        websocket_1.wsServer.broadcastToCharacter(character.id, {
            type: 'diary_entry',
            data: {
                id: diaryEntry.id,
                text: diaryEntry.text,
                source: diaryEntry.source,
                occurredAt: diaryEntry.occurredAt,
                locationName: diaryEntry.locationName,
                isGrouped: diaryEntry.isGrouped,
                isAnchored: diaryEntry.isAnchored,
            },
        });
    }
    if (character.objective && character.objective.progressScore < 100) {
        const progressDelta = (0, objective_1.calculateObjectiveProgress)(task.id, character.objective.type);
        const newProgress = Math.min(100, character.objective.progressScore + progressDelta);
        await db.character.updateObjectiveProgress(character.id, newProgress);
        character.objective.progressScore = newProgress;
    }
    if (character.objective && character.objective.progressScore >= 100) {
        const objectiveTypeMap = {
            social: 'exploratory',
            economic: 'social',
            exploratory: 'artisanal',
            spiritual: 'economic',
            military: 'spiritual',
            artisanal: 'military',
        };
        const newType = objectiveTypeMap[character.objective.type] || 'economic';
        const newObjective = {
            id: `obj-${Date.now()}`,
            description: `New ${newType} objective after completing the previous one`,
            type: newType,
            difficulty: Math.min(5, character.objective.difficulty + 1),
            progressScore: 0,
        };
        await db.character.update(character.id, { objective: newObjective });
        character.objective = newObjective;
    }
    const hoursSinceLogin = (Date.now() - new Date(character.lastPlayerLoginAt).getTime()) / (1000 * 60 * 60);
    const faithDecay = hoursSinceLogin > 24 ? Math.floor(hoursSinceLogin / 24) * 0.5 : 0;
    if (faithDecay > 0 && character.faith > 1) {
        const newFaith = Math.max(1, character.faith - faithDecay);
        await db.character.update(character.id, { faith: newFaith });
        if (character.faith - newFaith >= 2) {
            websocket_1.wsServer.broadcastToCharacter(character.id, {
                type: 'faith_change',
                data: { previousFaith: character.faith, newFaith, reason: 'absence_decay' },
            });
        }
        character.faith = newFaith;
    }
    if (pendingSuggestion) {
        const wasFollowed = pendingSuggestion.action.type === 'task' && pendingSuggestion.action.taskId === task.id;
        await db.suggestions.markProcessed(pendingSuggestion.id, wasFollowed);
        if (!wasFollowed && character.faith > 1) {
            const newFaith = Math.max(1, character.faith - 0.5);
            await db.character.update(character.id, { faith: newFaith });
            character.faith = newFaith;
        }
    }
    const tickCount = character.richTickCount || 0;
    if (tickCount > 0 && tickCount % 10 === 0 && character.commitments.length < 3) {
        const commitmentTasks = ['cultivate', 'forge_item', 'patrol', 'buy_goods', 'deliver_message'];
        const randomTask = commitmentTasks[Math.floor(Math.random() * commitmentTasks.length)];
        const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const newCommitment = {
            id: `commit-${Date.now()}`,
            description: `Complete ${randomTask} within 24 hours`,
            deadline,
            urgency: 'medium',
            taskId: randomTask,
            createdAt: new Date(),
        };
        const updatedCommitments = [...character.commitments, newCommitment];
        await db.character.update(character.id, { commitments: updatedCommitments });
        character.commitments = updatedCommitments;
    }
    const expiredCommitments = character.commitments.filter((c) => new Date(c.deadline).getTime() < Date.now());
    if (expiredCommitments.length > 0) {
        const faithPenalty = expiredCommitments.length * 0.5;
        const newFaith = Math.max(1, character.faith - faithPenalty);
        if (newFaith !== character.faith) {
            await db.character.update(character.id, { faith: newFaith });
            character.faith = newFaith;
            websocket_1.wsServer.broadcastToCharacter(character.id, {
                type: 'faith_change',
                data: { previousFaith: character.faith + faithPenalty, newFaith, reason: 'expired_commitments' },
            });
        }
        const negativeMoods = ['sadness', 'anger', 'fear'];
        for (const moodKey of negativeMoods) {
            character.mood[moodKey] = Math.min(10, character.mood[moodKey] + expiredCommitments.length * 0.5);
        }
        const validCommitments = character.commitments.filter((c) => new Date(c.deadline).getTime() >= Date.now());
        await db.character.update(character.id, { commitments: validCommitments });
        character.commitments = validCommitments;
    }
    const criticalCommitments = character.commitments.filter((c) => {
        const hoursLeft = (new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
        return hoursLeft > 0 && hoursLeft <= 6;
    });
    if (criticalCommitments.length > 0) {
        websocket_1.wsServer.broadcastToCharacter(character.id, {
            type: 'critical_commitment',
            data: {
                commitments: criticalCommitments.map((c) => ({ id: c.id, description: c.description, deadline: c.deadline })),
            },
        });
    }
    const hoursSinceLastTick = character.lastTickAt
        ? (Date.now() - new Date(character.lastTickAt).getTime()) / (1000 * 60 * 60)
        : 0;
    let decayedMood = hoursSinceLastTick > 0 ? (0, mood_1.decayMood)(character.mood, hoursSinceLastTick) : character.mood;
    if (activeEvents.length > 0) {
        for (const event of activeEvents) {
            if (event.name.toLowerCase().includes('conflito') || event.name.toLowerCase().includes('guerra')) {
                decayedMood.fear = Math.min(10, decayedMood.fear + 1);
                decayedMood.anger = Math.min(10, decayedMood.anger + 0.5);
            }
            if (event.name.toLowerCase().includes('festival') || event.name.toLowerCase().includes('celebração')) {
                decayedMood.joy = Math.min(10, decayedMood.joy + 1);
                decayedMood.surprise = Math.min(10, decayedMood.surprise + 0.5);
            }
            if (event.name.toLowerCase().includes('doença') || event.name.toLowerCase().includes('escassez')) {
                decayedMood.sadness = Math.min(10, decayedMood.sadness + 1);
                decayedMood.fear = Math.min(10, decayedMood.fear + 0.5);
            }
        }
    }
    if (relations.length > 0) {
        const highAffinityRelations = relations.filter((r) => r.affinityScore >= 5);
        if (highAffinityRelations.length > 0) {
            decayedMood.joy = Math.min(10, decayedMood.joy + highAffinityRelations.length * 0.3);
        }
        const negativeRelations = relations.filter((r) => r.affinityScore <= -5);
        if (negativeRelations.length > 0) {
            decayedMood.anger = Math.min(10, decayedMood.anger + negativeRelations.length * 0.3);
        }
    }
    await (0, milestone_system_1.groupTrivialEntries)(character.id, db);
    await (0, milestone_system_1.reevaluateSpecialization)(character, db, llm);
    if (pendingSuggestion) {
        const wasFollowed = pendingSuggestion.action.type === 'task' && pendingSuggestion.action.taskId === task.id;
        await db.suggestions.markProcessed(pendingSuggestion.id, wasFollowed);
    }
    const dynamicEvents = (0, dynamic_events_1.checkDynamicEvents)(character, task);
    if (dynamicEvents.length > 0) {
        websocket_1.wsServer.broadcastToCharacter(character.id, {
            type: 'world_event',
            data: {
                events: dynamicEvents.map((e) => ({ id: e.id, name: e.name, description: e.description })),
            },
        });
    }
    const narrativeMultiplier = (0, narrative_state_1.getNarrativeTickMultiplier)(narrativeState.richnessScore);
    const adjustedInterval = Math.round(interval * narrativeMultiplier);
    const nextTickAt = new Date(Date.now() + adjustedInterval);
    const characterUpdated = {
        lastTickAt: new Date(),
        nextTickAt,
        activityId: task.id,
        richTickCount: character.richTickCount,
        mood: decayedMood,
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