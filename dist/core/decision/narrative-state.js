"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RICH_STATE_THRESHOLD = exports.RICH_STATE_CONDITIONS = void 0;
exports.getNarrativeTickMultiplier = getNarrativeTickMultiplier;
exports.classifyNarrativeState = classifyNarrativeState;
exports.RICH_STATE_CONDITIONS = [
    { key: 'other_character_present', description: 'Outro personagem no mesmo local', weight: 2 },
    { key: 'interaction_occurred', description: 'Afazer envolveu interação com pessoa', weight: 2 },
    { key: 'commitment_resolved', description: 'Compromisso cumprido ou quebrado', weight: 2 },
    { key: 'milestone_triggered', description: 'Marco será registrado', weight: 3 },
    { key: 'player_suggestion_pending', description: 'Sugestão do jogador pendente', weight: 2 },
    { key: 'objective_progress_significant', description: 'Objetivo avançou 20%+', weight: 2 },
    { key: 'new_location_reached', description: 'Personagem chegou a local pela primeira vez', weight: 2 },
    { key: 'world_event_active', description: 'Evento de mundo ativo no local', weight: 2 },
    { key: 'mood_conflict', description: 'Humor penalizava afazer mas foi executado mesmo assim', weight: 2 },
];
exports.RICH_STATE_THRESHOLD = 2;
function getNarrativeTickMultiplier(richnessScore) {
    if (richnessScore >= 6)
        return 0.5;
    if (richnessScore >= 4)
        return 0.75;
    if (richnessScore >= 2)
        return 1.0;
    return 1.5;
}
function classifyNarrativeState(taskId, score, moodModifier, context) {
    const conditions = [];
    let richnessScore = 0;
    if (context.hasOtherCharacter) {
        conditions.push('other_character_present');
        richnessScore += 2;
    }
    if (context.hasInteraction) {
        conditions.push('interaction_occurred');
        richnessScore += 2;
    }
    if (context.hasCommitmentResolved) {
        conditions.push('commitment_resolved');
        richnessScore += 2;
    }
    if (context.hasMilestoneTriggered) {
        conditions.push('milestone_triggered');
        richnessScore += 3;
    }
    if (context.hasPendingSuggestion) {
        conditions.push('player_suggestion_pending');
        richnessScore += 2;
    }
    if (context.objectiveProgressDelta >= 20) {
        conditions.push('objective_progress_significant');
        richnessScore += 2;
    }
    if (context.isNewLocation) {
        conditions.push('new_location_reached');
        richnessScore += 2;
    }
    if (context.hasActiveWorldEvent) {
        conditions.push('world_event_active');
        richnessScore += 2;
    }
    if (moodModifier <= -2) {
        conditions.push('mood_conflict');
        richnessScore += 2;
    }
    return {
        isRich: richnessScore >= exports.RICH_STATE_THRESHOLD,
        conditions,
        hasMoodConflict: moodModifier <= -2,
        richnessScore,
    };
}
//# sourceMappingURL=narrative-state.js.map