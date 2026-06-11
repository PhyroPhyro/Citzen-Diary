import { Character } from '../models';
import { ScoredTask } from '../core/decision';
import { NarrativeStateResult } from '../core/decision/narrative-state';
import { getLocationById, getEventsByLocation, Location, WorldEvent } from '../data/world';
import { getDominantMood } from '../models/mood';

export function buildLLMContext(
  character: Character,
  chosenTask: ScoredTask,
  narrativeState: NarrativeStateResult,
  location: Location | undefined,
  activeEvents: WorldEvent[],
  recentDiary: string[]
): string {
  const { state: moodState } = getDominantMood(character.mood);
  const locationName = location?.name || 'Desconhecido';
  const locationType = location?.type || 'desconhecido';
  const eventsStr = activeEvents.length > 0 ? activeEvents.map((e) => e.name).join(', ') : 'nenhum';

  const lines = [
    `[LOCAL] ${locationName} | ${locationType} | eventos: ${eventsStr}`,
    `[PERSONAGEM] ${character.name} | ${character.vocation} | ${character.position || 'sem cargo'} | espec: ${character.emergentSpecialization || 'indefinida'}`,
    `[BIO] ${character.bio || 'Sem bio definida.'}`,
    `[TRAÇOS] Ab:${character.traits.openness} Co:${character.traits.conscientiousness} Ex:${character.traits.extraversion} Es:${character.traits.emotionalStability} Ag:${character.traits.agreeableness}`,
    `[HUMOR] ${moodState} — Joy:${character.mood.joy} Sad:${character.mood.sadness} Ang:${character.mood.anger} Fear:${character.mood.fear} Disg:${character.mood.disgust} Sur:${character.mood.surprise}`,
    `[FÉ] ${character.faith}`,
    `[OBJETIVO] tipo:${character.objective?.type || 'economic'} | progresso:${character.objective?.progressScore || 0}%`,
    `[COMPROMISSOS] ${character.commitments.length > 0 ? character.commitments.map((c: { description: string }) => c.description).join('; ') : 'nenhum'}`,
    `[RELAÇÕES PRESENTES] nenhum`,
    `[AÇÃO EXECUTADA] ${chosenTask.task.id} | score:${chosenTask.score.toFixed(1)} | resultado: executou ${chosenTask.task.name}`,
    `[CANDIDATOS PERDEDORES]`,
  ];

  if (narrativeState.hasMoodConflict) {
    lines.push(`[CONFLITO] O personagem estava com humor desfavorável mas agiu assim mesmo.`);
  }

  if (recentDiary.length > 0) {
    lines.push('[DIÁRIO RECENTE]');
    for (const entry of recentDiary.slice(-2)) {
      lines.push(`> ${entry}`);
    }
  }

  lines.push(`[INSTRUÇÃO] Escreva 1 entrada de diário na primeira pessoa, voz de ${character.name}. Tom: ${moodState}. Máximo 3 linhas. Sem aspas. Retorne JSON: {"diary_entry":"...","chosen_action":"${chosenTask.task.id}"}`);

  return lines.join('\n');
}
