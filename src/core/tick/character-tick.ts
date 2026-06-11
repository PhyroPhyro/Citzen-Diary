import { Character, DiaryEntry, Milestone, PendingPlayerAction } from '../../models';
import { runDecisionMotor, DecisionContext, ScoredTask } from '../decision';
import { classifyNarrativeState, NarrativeStateResult } from '../decision/narrative-state';
import { buildLLMContext } from '../../diary/llm-context';
import { generateTemplateEntry } from '../../diary/generator';
import { LLMProvider } from '../../llm';
import { DBAdapter } from '../../db';
import { QueueAdapter } from '../../queue';
import { getTasksByVocation, UNIVERSAL_TASKS, getTaskById } from '../../data/tasks';
import { getLocationById, getEventsByLocation } from '../../data/world';
import { processMilestones, MilestoneCheckContext, groupTrivialEntries, reevaluateSpecialization } from '../npc/milestone-system';
import { calculateObjectiveProgress } from '../../models/objective';

export interface TickResult {
  characterId: string;
  chosenTask: ScoredTask;
  narrativeState: NarrativeStateResult;
  diaryEntry: DiaryEntry | null;
  milestone: Milestone | null;
  nextTickAt: Date;
  characterUpdated: Partial<Character>;
}

export function calculateTickInterval(character: Character): number {
  const hoursSinceLogin = (Date.now() - character.lastPlayerLoginAt.getTime()) / (1000 * 60 * 60);

  let absenceInterval: number;
  if (hoursSinceLogin <= 3) absenceInterval = 30 * 60 * 1000;
  else if (hoursSinceLogin <= 6) absenceInterval = 60 * 60 * 1000;
  else if (hoursSinceLogin <= 9) absenceInterval = 2 * 60 * 60 * 1000;
  else if (hoursSinceLogin <= 12) absenceInterval = 3 * 60 * 60 * 1000;
  else if (hoursSinceLogin <= 24) absenceInterval = 4 * 60 * 60 * 1000;
  else if (hoursSinceLogin <= 48) absenceInterval = 5 * 60 * 60 * 1000;
  else return -1;

  if (character.isNpc) return -1;

  return absenceInterval;
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
  const interval = calculateTickInterval(character);
  if (interval === -1) return null;

  const pendingSuggestion = await db.suggestions.getPending(character.id);

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
    relationsInLocation: [],
  };

  const top3 = runDecisionMotor(character, context);
  if (top3.length === 0) return null;

  const chosen = top3[0];
  const task = chosen.task;

  const location = getLocationById(character.locationId);
  const activeEvents = location ? getEventsByLocation(character.locationId) : [];

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

  if (narrativeState.isRich) {
    const llmContext = buildLLMContext(character, chosen, narrativeState, location, activeEvents, []);
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
  } else {
    diaryEntry = generateTemplateEntry(character, task);
  }

  if (diaryEntry) {
    await db.diary.create(diaryEntry);
    await db.diary.enforceLimit(character.id, 30);
  }

  if (character.objective && character.objective.progressScore < 100) {
    const progressDelta = calculateObjectiveProgress(task.id, character.objective.type);
    const newProgress = Math.min(100, character.objective.progressScore + progressDelta);
    await db.character.updateObjectiveProgress(character.id, newProgress);
    character.objective.progressScore = newProgress;
  }

  await groupTrivialEntries(character.id, db);
  await reevaluateSpecialization(character, db, llm);

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

  const characterUpdated: Partial<Character> = {
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
