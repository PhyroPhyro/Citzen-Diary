import { Character, DiaryEntry } from '../models';
import { getTemplateForTask, getToneSuffix } from '../data/templates';
import { getDominantMood } from '../models/mood';
import { getTaskById } from '../data/tasks';

export function generateTemplateEntry(character: Character, task: { id: string; name: string }): DiaryEntry {
  const template = getTemplateForTask(task.id);
  const { state: moodState } = getDominantMood(character.mood);

  let text: string;
  if (template) {
    const variationIndex = Math.floor(Math.random() * template.variations.length);
    const base = template.variations[variationIndex];
    const suffix = getToneSuffix(template, moodState);
    text = suffix ? `${base} ${suffix}` : base;
  } else {
    text = 'O dia passou sem grandes eventos.';
  }

  return {
    id: crypto.randomUUID(),
    characterId: character.id,
    text,
    source: 'template',
    occurredAt: new Date(),
    createdAt: new Date(),
    locationId: character.locationId,
    locationName: 'Desconhecido',
    taskId: task.id,
    moodState,
    isGrouped: false,
    groupCount: null,
    isAnchored: false,
    milestoneId: null,
  };
}
