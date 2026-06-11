"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RICH_STATE_CONDITIONS = void 0;
exports.classifyNarrativeState = classifyNarrativeState;
exports.RICH_STATE_CONDITIONS = [
    { key: 'other_character_present', description: 'Outro personagem no mesmo local' },
    { key: 'interaction_occurred', description: 'Afazer envolveu interação com pessoa' },
    { key: 'commitment_resolved', description: 'Compromisso cumprido ou quebrado' },
    { key: 'milestone_triggered', description: 'Marco será registrado' },
    { key: 'player_suggestion_pending', description: 'Sugestão do jogador pendente' },
    { key: 'objective_progress_significant', description: 'Objetivo avançou 20%+' },
    { key: 'new_location_reached', description: 'Personagem chegou a local pela primeira vez' },
    { key: 'world_event_active', description: 'Evento de mundo ativo no local' },
    { key: 'mood_conflict', description: 'Humor penalizava afazer mas foi executado mesmo assim' },
];
function classifyNarrativeState(taskId, score, moodModifier, context) {
    const conditions = [];
    if (context.hasOtherCharacter)
        conditions.push('other_character_present');
    if (context.hasInteraction)
        conditions.push('interaction_occurred');
    if (context.hasCommitmentResolved)
        conditions.push('commitment_resolved');
    if (context.hasMilestoneTriggered)
        conditions.push('milestone_triggered');
    if (context.hasPendingSuggestion)
        conditions.push('player_suggestion_pending');
    if (context.objectiveProgressDelta >= 20)
        conditions.push('objective_progress_significant');
    if (context.isNewLocation)
        conditions.push('new_location_reached');
    if (context.hasActiveWorldEvent)
        conditions.push('world_event_active');
    if (moodModifier <= -2)
        conditions.push('mood_conflict');
    return {
        isRich: conditions.length > 0,
        conditions,
        hasMoodConflict: moodModifier <= -2,
    };
}
//# sourceMappingURL=narrative-state.js.map