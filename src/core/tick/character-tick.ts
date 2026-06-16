import { Character, DiaryEntry, Milestone, PendingPlayerAction } from '../../models';
import { runDecisionMotor, DecisionContext, ScoredTask } from '../decision';
import { classifyNarrativeState, NarrativeStateResult, getNarrativeTickMultiplier } from '../decision/narrative-state';
import { buildLLMContext } from '../../diary/llm-context';
import { generateTemplateEntry } from '../../diary/generator';
import { LLMProvider } from '../../llm';
import { DBAdapter } from '../../db';
import { QueueAdapter } from '../../queue';
import { getTasksByVocation, UNIVERSAL_TASKS, getTaskById, TaskDefinition } from '../../data/tasks';
import { getLocationById, getEventsByLocation, WorldEvent } from '../../data/world';
import { wsServer } from '../../api/websocket';
import { processMilestones, MilestoneCheckContext, groupTrivialEntries, reevaluateSpecialization } from '../npc/milestone-system';
import { getNpcTickInterval, buildNpcRelationships, processNpcMood, getDominantEmotion } from '../npc/npc-autonomy';
import { findNearbyCharacters, createInteractionEvent } from '../npc/cross-character';
import { calculateObjectiveProgress } from '../../models/objective';
import { decayMood } from '../../models/mood';
import { checkDynamicEvents } from '../../world/dynamic-events';
import { getResourcesByProducerTask, getResourcesByConsumerTask } from '../../data/resources';
import { addToInventory, removeFromInventory } from '../economy/market';
import { advanceQuestStep, getQuestMilestoneTrigger } from '../quests/quest-engine';
import { awardSkillXp } from '../combat/combat-engine';

export interface TickResult {
  characterId: string;
  chosenTask: ScoredTask;
  narrativeState: NarrativeStateResult;
  diaryEntry: DiaryEntry | null;
  milestone: Milestone | null;
  nextTickAt: Date;
  characterUpdated: Partial<Character>;
}

export function calculateTickInterval(character: Character, lastRichnessScore = 0): number {
  const hoursSinceLogin = (Date.now() - character.lastPlayerLoginAt.getTime()) / (1000 * 60 * 60);

  let absenceInterval: number;
  if (hoursSinceLogin <= 3) absenceInterval = 30 * 60 * 1000;
  else if (hoursSinceLogin <= 6) absenceInterval = 60 * 60 * 1000;
  else if (hoursSinceLogin <= 9) absenceInterval = 2 * 60 * 60 * 1000;
  else if (hoursSinceLogin <= 12) absenceInterval = 3 * 60 * 60 * 1000;
  else if (hoursSinceLogin <= 24) absenceInterval = 4 * 60 * 60 * 1000;
  else if (hoursSinceLogin <= 48) absenceInterval = 5 * 60 * 60 * 1000;
  else return -1;

  if (character.isNpc) return getNpcTickInterval();

  const narrativeMultiplier = getNarrativeTickMultiplier(lastRichnessScore);
  return Math.round(absenceInterval * narrativeMultiplier);
}

export function shouldConvertToNPC(character: Character): boolean {
  if (character.isNpc) return false;
  const hoursSinceLogin = (Date.now() - character.lastPlayerLoginAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceLogin > 48;
}

export async function executeCharacterTick(
  character: Character,
  db: DBAdapter,
  queue: QueueAdapter,
  llm: LLMProvider
): Promise<TickResult | null> {
  const interval = calculateTickInterval(character, 0);
  if (interval === -1) return null;

  const pendingSuggestion = await db.suggestions.getPending(character.id);
  const activeMilestones = await db.milestones.getActiveContext(character.id);
  const relations = await db.relations.getByCharacterId(character.id);
  const activeEvents = getEventsByLocation(character.locationId);

  const relationsInLocation = relations
    .filter((r) => r.targetType === 'npc')
    .map((r) => ({ targetId: r.targetId, affinity: r.affinityScore }));

  const context: DecisionContext = {
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

  const top3 = runDecisionMotor(character, context);
  if (top3.length === 0) return null;

  const chosen = top3[0];
  const task = chosen.task;

  const location = getLocationById(character.locationId);

  const narrativeState = classifyNarrativeState(task.id, chosen.score, chosen.breakdown.mood, {
    hasOtherCharacter: false,
    hasInteraction: task.category === 'social',
    hasCommitmentResolved: chosen.breakdown.commitment >= 3,
    hasMilestoneTriggered: false,
    hasPendingSuggestion: !!pendingSuggestion,
    objectiveProgressDelta: 0,
    isNewLocation: false,
    hasActiveWorldEvent: activeEvents.length > 0,
  });

  let diaryEntry: DiaryEntry | null = null;
  let milestone: Milestone | null = null;
  let milestoneId: string | null = null;
  let isAnchored = false;

  const milestoneContext: MilestoneCheckContext = {
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

  const newMilestones = await processMilestones(milestoneContext, db, llm);
  if (newMilestones.length > 0) {
    const firstMilestone = newMilestones[0];
    milestone = firstMilestone;
    milestoneId = firstMilestone.id;
    isAnchored = firstMilestone.importance !== 'minor';
  }

  if (narrativeState.isRich && !character.isNpc) {
    const llmContext = buildLLMContext(character, chosen, narrativeState, location, activeEvents, []);
    const llmResult = await llm.generateDiaryEntry(llmContext);

    const isCascade = llm.constructor.name === 'CascadeLLMProvider';
    const activeProvider = isCascade ? (llm as any).activeProvider : llm.constructor.name;
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
  } else {
    diaryEntry = generateTemplateEntry(character, task);
    if (milestoneId) {
      diaryEntry.milestoneId = milestoneId;
      diaryEntry.isAnchored = isAnchored;
    }
  }

  if (diaryEntry) {
    await db.diary.create(diaryEntry);
    await db.diary.enforceLimit(character.id, 30);

    wsServer.broadcastToCharacter(character.id, {
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

  // Economy: resource production and consumption
  try {
    await db.economy.createInventory(character.id);
    const producedResources = getResourcesByProducerTask(task.id);
    for (const res of producedResources) {
      const quantity = task.category === 'work' ? 2 : 1;
      await db.economy.updateInventory(character.id, res.id, quantity);
    }
    const consumedResources = getResourcesByConsumerTask(task.id);
    for (const res of consumedResources) {
      const inv = await db.economy.getInventory(character.id);
      const hasItem = inv.items.find((i: any) => i.resourceId === res.id);
      if (hasItem && hasItem.quantity >= 1) {
        await db.economy.updateInventory(character.id, res.id, -1);
      }
    }
    const baseGoldEarned = task.baseScore >= 8 ? 5 : task.baseScore >= 5 ? 3 : 1;
    const inv = await db.economy.getInventory(character.id);
    await db.economy.updateGold(character.id, inv.gold + baseGoldEarned);
  } catch (e) {
    // Economy processing is non-critical, continue
  }

  // Skill XP gain based on task
  try {
    await awardSkillXp(character.id, task.id, db);
  } catch (e) {
    // Skill XP is non-critical, continue
  }

  // Quest processing: advance active quests based on chosen task
  try {
    const activeQuests = await db.quests.getActive(character.id);
    for (const quest of activeQuests) {
      const advanced = await advanceQuestStep(quest, character, task.id, character.locationId, llm, db);
      if (advanced && advanced.state === 'completed') {
        const questTrigger = getQuestMilestoneTrigger(advanced);
        if (questTrigger) {
          milestone = {
            id: crypto.randomUUID(),
            characterId: character.id,
            importance: advanced.tier >= 3 ? 'decisive' : advanced.tier >= 2 ? 'relevant' : 'minor',
            title: `Missão Completa: ${advanced.title}`,
            description: `${advanced.title} foi concluída com sucesso.`,
            occurredAt: new Date(),
            locationId: character.locationId,
            locationName: location?.name || 'Desconhecido',
            triggerType: questTrigger,
            relatedCharacterIds: [],
            relatedEventId: null,
            diaryEntryId: diaryEntry?.id || null,
            isActiveContext: true,
            parentMilestoneId: null,
            chainOrder: 0,
          };
          await db.milestones.create(milestone as any);
        }
      }
    }
  } catch (e) {
    // Quest processing is non-critical, continue
  }

  // NPC-specific: relationship building and cross-character interaction
  try {
    const allActive = await db.character.getAllActive();
    await buildNpcRelationships(character.id, character.locationId, db, allActive);

    const nearby = allActive.filter((c) => c.locationId === character.locationId && c.id !== character.id && !c.isNpc);
    if (nearby.length > 0) {
      const interaction = await createInteractionEvent(character, nearby, db);
      if (interaction) {
        const outcome = interaction.outcomes.find((o) => o.characterId === character.id);
        if (outcome) {
          for (const [emotion, delta] of Object.entries(outcome.moodDelta)) {
            const key = emotion as keyof typeof character.mood;
            character.mood[key] = Math.max(0, Math.min(10, character.mood[key] + delta));
          }
        }
      }
    }

    // NPC autonomous mood drift
    if (character.isNpc) {
      character.mood = processNpcMood(character.mood);
    }
  } catch (e) {
    // NPC interaction is non-critical, continue
  }

  if (character.objective && character.objective.progressScore < 100) {
    const progressDelta = calculateObjectiveProgress(task.id, character.objective.type);
    const newProgress = Math.min(100, character.objective.progressScore + progressDelta);
    await db.character.updateObjectiveProgress(character.id, newProgress);
    character.objective.progressScore = newProgress;
  }

  if (character.objective && character.objective.progressScore >= 100) {
    const objectiveTypeMap: Record<string, string> = {
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
    await db.character.update(character.id, { objective: newObjective as any });
    character.objective = newObjective;
  }

  const hoursSinceLogin = (Date.now() - new Date(character.lastPlayerLoginAt).getTime()) / (1000 * 60 * 60);
  const faithDecay = hoursSinceLogin > 24 ? Math.floor(hoursSinceLogin / 24) * 0.5 : 0;
  if (faithDecay > 0 && character.faith > 1) {
    const newFaith = Math.max(1, character.faith - faithDecay);
    await db.character.update(character.id, { faith: newFaith });
    if (character.faith - newFaith >= 2) {
      wsServer.broadcastToCharacter(character.id, {
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
      urgency: 'medium' as const,
      taskId: randomTask,
      createdAt: new Date(),
    };
    const updatedCommitments = [...character.commitments, newCommitment];
    await db.character.update(character.id, { commitments: updatedCommitments as any });
    character.commitments = updatedCommitments;
  }

  const expiredCommitments = character.commitments.filter((c) => new Date(c.deadline).getTime() < Date.now());
  if (expiredCommitments.length > 0) {
    const faithPenalty = expiredCommitments.length * 0.5;
    const newFaith = Math.max(1, character.faith - faithPenalty);
    if (newFaith !== character.faith) {
      await db.character.update(character.id, { faith: newFaith });
      character.faith = newFaith;
      wsServer.broadcastToCharacter(character.id, {
        type: 'faith_change',
        data: { previousFaith: character.faith + faithPenalty, newFaith, reason: 'expired_commitments' },
      });
    }
    const negativeMoods: (keyof typeof character.mood)[] = ['sadness', 'anger', 'fear'];
    for (const moodKey of negativeMoods) {
      character.mood[moodKey] = Math.min(10, character.mood[moodKey] + expiredCommitments.length * 0.5);
    }
    const validCommitments = character.commitments.filter((c) => new Date(c.deadline).getTime() >= Date.now());
    await db.character.update(character.id, { commitments: validCommitments as any });
    character.commitments = validCommitments;
  }

  const criticalCommitments = character.commitments.filter((c) => {
    const hoursLeft = (new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft <= 6;
  });
  if (criticalCommitments.length > 0) {
    wsServer.broadcastToCharacter(character.id, {
      type: 'critical_commitment',
      data: {
        commitments: criticalCommitments.map((c) => ({ id: c.id, description: c.description, deadline: c.deadline })),
      },
    });
  }

  const hoursSinceLastTick = character.lastTickAt
    ? (Date.now() - new Date(character.lastTickAt).getTime()) / (1000 * 60 * 60)
    : 0;
  let decayedMood = hoursSinceLastTick > 0 ? decayMood(character.mood, hoursSinceLastTick) : character.mood;

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

  await groupTrivialEntries(character.id, db);
  await reevaluateSpecialization(character, db, llm);

  if (pendingSuggestion) {
    const wasFollowed = pendingSuggestion.action.type === 'task' && pendingSuggestion.action.taskId === task.id;
    await db.suggestions.markProcessed(pendingSuggestion.id, wasFollowed);
  }

  const dynamicEvents = checkDynamicEvents(character, task as TaskDefinition);
  if (dynamicEvents.length > 0) {
    wsServer.broadcastToCharacter(character.id, {
      type: 'world_event',
      data: {
        events: dynamicEvents.map((e) => ({ id: e.id, name: e.name, description: e.description })),
      },
    });
  }

  const narrativeMultiplier = getNarrativeTickMultiplier(narrativeState.richnessScore);
  const adjustedInterval = Math.round(interval * narrativeMultiplier);
  const nextTickAt = new Date(Date.now() + adjustedInterval);

  const characterUpdated: Partial<Character> = {
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
