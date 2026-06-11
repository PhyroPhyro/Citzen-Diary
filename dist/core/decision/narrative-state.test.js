"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const narrative_state_1 = require("./narrative-state");
(0, vitest_1.describe)('classifyNarrativeState', () => {
    (0, vitest_1.it)('returns not rich when no conditions are met', () => {
        const result = (0, narrative_state_1.classifyNarrativeState)('rest', 5, 0, {
            hasOtherCharacter: false,
            hasInteraction: false,
            hasCommitmentResolved: false,
            hasMilestoneTriggered: false,
            hasPendingSuggestion: false,
            objectiveProgressDelta: 0,
            isNewLocation: false,
            hasActiveWorldEvent: false,
        });
        (0, vitest_1.expect)(result.isRich).toBe(false);
        (0, vitest_1.expect)(result.conditions.length).toBe(0);
    });
    (0, vitest_1.it)('returns rich when other character is present', () => {
        const result = (0, narrative_state_1.classifyNarrativeState)('visit_known', 8, 0, {
            hasOtherCharacter: true,
            hasInteraction: false,
            hasCommitmentResolved: false,
            hasMilestoneTriggered: false,
            hasPendingSuggestion: false,
            objectiveProgressDelta: 0,
            isNewLocation: false,
            hasActiveWorldEvent: false,
        });
        (0, vitest_1.expect)(result.isRich).toBe(true);
        (0, vitest_1.expect)(result.conditions).toContain('other_character_present');
    });
    (0, vitest_1.it)('returns rich when interaction occurred', () => {
        const result = (0, narrative_state_1.classifyNarrativeState)('visit_known', 8, 0, {
            hasOtherCharacter: false,
            hasInteraction: true,
            hasCommitmentResolved: false,
            hasMilestoneTriggered: false,
            hasPendingSuggestion: false,
            objectiveProgressDelta: 0,
            isNewLocation: false,
            hasActiveWorldEvent: false,
        });
        (0, vitest_1.expect)(result.isRich).toBe(true);
        (0, vitest_1.expect)(result.conditions).toContain('interaction_occurred');
    });
    (0, vitest_1.it)('returns rich when commitment resolved', () => {
        const result = (0, narrative_state_1.classifyNarrativeState)('deliver_message', 10, 0, {
            hasOtherCharacter: false,
            hasInteraction: false,
            hasCommitmentResolved: true,
            hasMilestoneTriggered: false,
            hasPendingSuggestion: false,
            objectiveProgressDelta: 0,
            isNewLocation: false,
            hasActiveWorldEvent: false,
        });
        (0, vitest_1.expect)(result.isRich).toBe(true);
        (0, vitest_1.expect)(result.conditions).toContain('commitment_resolved');
    });
    (0, vitest_1.it)('returns rich when milestone triggered', () => {
        const result = (0, narrative_state_1.classifyNarrativeState)('cultivate', 8, 0, {
            hasOtherCharacter: false,
            hasInteraction: false,
            hasCommitmentResolved: false,
            hasMilestoneTriggered: true,
            hasPendingSuggestion: false,
            objectiveProgressDelta: 0,
            isNewLocation: false,
            hasActiveWorldEvent: false,
        });
        (0, vitest_1.expect)(result.isRich).toBe(true);
        (0, vitest_1.expect)(result.conditions).toContain('milestone_triggered');
    });
    (0, vitest_1.it)('returns rich when pending suggestion exists', () => {
        const result = (0, narrative_state_1.classifyNarrativeState)('rest', 5, 0, {
            hasOtherCharacter: false,
            hasInteraction: false,
            hasCommitmentResolved: false,
            hasMilestoneTriggered: false,
            hasPendingSuggestion: true,
            objectiveProgressDelta: 0,
            isNewLocation: false,
            hasActiveWorldEvent: false,
        });
        (0, vitest_1.expect)(result.isRich).toBe(true);
        (0, vitest_1.expect)(result.conditions).toContain('player_suggestion_pending');
    });
    (0, vitest_1.it)('returns rich when objective progress is significant (>=20%)', () => {
        const result = (0, narrative_state_1.classifyNarrativeState)('cultivate', 8, 0, {
            hasOtherCharacter: false,
            hasInteraction: false,
            hasCommitmentResolved: false,
            hasMilestoneTriggered: false,
            hasPendingSuggestion: false,
            objectiveProgressDelta: 25,
            isNewLocation: false,
            hasActiveWorldEvent: false,
        });
        (0, vitest_1.expect)(result.isRich).toBe(true);
        (0, vitest_1.expect)(result.conditions).toContain('objective_progress_significant');
    });
    (0, vitest_1.it)('does not return rich for small objective progress (<20%)', () => {
        const result = (0, narrative_state_1.classifyNarrativeState)('cultivate', 8, 0, {
            hasOtherCharacter: false,
            hasInteraction: false,
            hasCommitmentResolved: false,
            hasMilestoneTriggered: false,
            hasPendingSuggestion: false,
            objectiveProgressDelta: 15,
            isNewLocation: false,
            hasActiveWorldEvent: false,
        });
        (0, vitest_1.expect)(result.isRich).toBe(false);
    });
    (0, vitest_1.it)('returns rich when new location reached', () => {
        const result = (0, narrative_state_1.classifyNarrativeState)('travel', 8, 0, {
            hasOtherCharacter: false,
            hasInteraction: false,
            hasCommitmentResolved: false,
            hasMilestoneTriggered: false,
            hasPendingSuggestion: false,
            objectiveProgressDelta: 0,
            isNewLocation: true,
            hasActiveWorldEvent: false,
        });
        (0, vitest_1.expect)(result.isRich).toBe(true);
        (0, vitest_1.expect)(result.conditions).toContain('new_location_reached');
    });
    (0, vitest_1.it)('returns rich when world event is active', () => {
        const result = (0, narrative_state_1.classifyNarrativeState)('patrol', 8, 0, {
            hasOtherCharacter: false,
            hasInteraction: false,
            hasCommitmentResolved: false,
            hasMilestoneTriggered: false,
            hasPendingSuggestion: false,
            objectiveProgressDelta: 0,
            isNewLocation: false,
            hasActiveWorldEvent: true,
        });
        (0, vitest_1.expect)(result.isRich).toBe(true);
        (0, vitest_1.expect)(result.conditions).toContain('world_event_active');
    });
    (0, vitest_1.it)('returns rich and mood conflict when mood modifier <= -2', () => {
        const result = (0, narrative_state_1.classifyNarrativeState)('explore_route', 8, -3, {
            hasOtherCharacter: false,
            hasInteraction: false,
            hasCommitmentResolved: false,
            hasMilestoneTriggered: false,
            hasPendingSuggestion: false,
            objectiveProgressDelta: 0,
            isNewLocation: false,
            hasActiveWorldEvent: false,
        });
        (0, vitest_1.expect)(result.isRich).toBe(true);
        (0, vitest_1.expect)(result.conditions).toContain('mood_conflict');
        (0, vitest_1.expect)(result.hasMoodConflict).toBe(true);
    });
    (0, vitest_1.it)('does not flag mood conflict when modifier > -2', () => {
        const result = (0, narrative_state_1.classifyNarrativeState)('rest', 5, -1, {
            hasOtherCharacter: false,
            hasInteraction: false,
            hasCommitmentResolved: false,
            hasMilestoneTriggered: false,
            hasPendingSuggestion: false,
            objectiveProgressDelta: 0,
            isNewLocation: false,
            hasActiveWorldEvent: false,
        });
        (0, vitest_1.expect)(result.hasMoodConflict).toBe(false);
    });
    (0, vitest_1.it)('accumulates multiple conditions', () => {
        const result = (0, narrative_state_1.classifyNarrativeState)('visit_known', 10, -2, {
            hasOtherCharacter: true,
            hasInteraction: true,
            hasCommitmentResolved: false,
            hasMilestoneTriggered: false,
            hasPendingSuggestion: false,
            objectiveProgressDelta: 0,
            isNewLocation: false,
            hasActiveWorldEvent: false,
        });
        (0, vitest_1.expect)(result.conditions.length).toBeGreaterThanOrEqual(3);
    });
});
//# sourceMappingURL=narrative-state.test.js.map