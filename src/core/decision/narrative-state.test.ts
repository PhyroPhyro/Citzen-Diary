import { describe, it, expect } from 'vitest';
import { classifyNarrativeState, NarrativeStateResult } from './narrative-state';

describe('classifyNarrativeState', () => {
  it('returns not rich when no conditions are met', () => {
    const result = classifyNarrativeState('rest', 5, 0, {
      hasOtherCharacter: false,
      hasInteraction: false,
      hasCommitmentResolved: false,
      hasMilestoneTriggered: false,
      hasPendingSuggestion: false,
      objectiveProgressDelta: 0,
      isNewLocation: false,
      hasActiveWorldEvent: false,
    });

    expect(result.isRich).toBe(false);
    expect(result.conditions.length).toBe(0);
  });

  it('returns rich when other character is present', () => {
    const result = classifyNarrativeState('visit_known', 8, 0, {
      hasOtherCharacter: true,
      hasInteraction: false,
      hasCommitmentResolved: false,
      hasMilestoneTriggered: false,
      hasPendingSuggestion: false,
      objectiveProgressDelta: 0,
      isNewLocation: false,
      hasActiveWorldEvent: false,
    });

    expect(result.isRich).toBe(true);
    expect(result.conditions).toContain('other_character_present');
  });

  it('returns rich when interaction occurred', () => {
    const result = classifyNarrativeState('visit_known', 8, 0, {
      hasOtherCharacter: false,
      hasInteraction: true,
      hasCommitmentResolved: false,
      hasMilestoneTriggered: false,
      hasPendingSuggestion: false,
      objectiveProgressDelta: 0,
      isNewLocation: false,
      hasActiveWorldEvent: false,
    });

    expect(result.isRich).toBe(true);
    expect(result.conditions).toContain('interaction_occurred');
  });

  it('returns rich when commitment resolved', () => {
    const result = classifyNarrativeState('deliver_message', 10, 0, {
      hasOtherCharacter: false,
      hasInteraction: false,
      hasCommitmentResolved: true,
      hasMilestoneTriggered: false,
      hasPendingSuggestion: false,
      objectiveProgressDelta: 0,
      isNewLocation: false,
      hasActiveWorldEvent: false,
    });

    expect(result.isRich).toBe(true);
    expect(result.conditions).toContain('commitment_resolved');
  });

  it('returns rich when milestone triggered', () => {
    const result = classifyNarrativeState('cultivate', 8, 0, {
      hasOtherCharacter: false,
      hasInteraction: false,
      hasCommitmentResolved: false,
      hasMilestoneTriggered: true,
      hasPendingSuggestion: false,
      objectiveProgressDelta: 0,
      isNewLocation: false,
      hasActiveWorldEvent: false,
    });

    expect(result.isRich).toBe(true);
    expect(result.conditions).toContain('milestone_triggered');
  });

  it('returns rich when pending suggestion exists', () => {
    const result = classifyNarrativeState('rest', 5, 0, {
      hasOtherCharacter: false,
      hasInteraction: false,
      hasCommitmentResolved: false,
      hasMilestoneTriggered: false,
      hasPendingSuggestion: true,
      objectiveProgressDelta: 0,
      isNewLocation: false,
      hasActiveWorldEvent: false,
    });

    expect(result.isRich).toBe(true);
    expect(result.conditions).toContain('player_suggestion_pending');
  });

  it('returns rich when objective progress is significant (>=20%)', () => {
    const result = classifyNarrativeState('cultivate', 8, 0, {
      hasOtherCharacter: false,
      hasInteraction: false,
      hasCommitmentResolved: false,
      hasMilestoneTriggered: false,
      hasPendingSuggestion: false,
      objectiveProgressDelta: 25,
      isNewLocation: false,
      hasActiveWorldEvent: false,
    });

    expect(result.isRich).toBe(true);
    expect(result.conditions).toContain('objective_progress_significant');
  });

  it('does not return rich for small objective progress (<20%)', () => {
    const result = classifyNarrativeState('cultivate', 8, 0, {
      hasOtherCharacter: false,
      hasInteraction: false,
      hasCommitmentResolved: false,
      hasMilestoneTriggered: false,
      hasPendingSuggestion: false,
      objectiveProgressDelta: 15,
      isNewLocation: false,
      hasActiveWorldEvent: false,
    });

    expect(result.isRich).toBe(false);
  });

  it('returns rich when new location reached', () => {
    const result = classifyNarrativeState('travel', 8, 0, {
      hasOtherCharacter: false,
      hasInteraction: false,
      hasCommitmentResolved: false,
      hasMilestoneTriggered: false,
      hasPendingSuggestion: false,
      objectiveProgressDelta: 0,
      isNewLocation: true,
      hasActiveWorldEvent: false,
    });

    expect(result.isRich).toBe(true);
    expect(result.conditions).toContain('new_location_reached');
  });

  it('returns rich when world event is active', () => {
    const result = classifyNarrativeState('patrol', 8, 0, {
      hasOtherCharacter: false,
      hasInteraction: false,
      hasCommitmentResolved: false,
      hasMilestoneTriggered: false,
      hasPendingSuggestion: false,
      objectiveProgressDelta: 0,
      isNewLocation: false,
      hasActiveWorldEvent: true,
    });

    expect(result.isRich).toBe(true);
    expect(result.conditions).toContain('world_event_active');
  });

  it('returns rich and mood conflict when mood modifier <= -2', () => {
    const result = classifyNarrativeState('explore_route', 8, -3, {
      hasOtherCharacter: false,
      hasInteraction: false,
      hasCommitmentResolved: false,
      hasMilestoneTriggered: false,
      hasPendingSuggestion: false,
      objectiveProgressDelta: 0,
      isNewLocation: false,
      hasActiveWorldEvent: false,
    });

    expect(result.isRich).toBe(true);
    expect(result.conditions).toContain('mood_conflict');
    expect(result.hasMoodConflict).toBe(true);
  });

  it('does not flag mood conflict when modifier > -2', () => {
    const result = classifyNarrativeState('rest', 5, -1, {
      hasOtherCharacter: false,
      hasInteraction: false,
      hasCommitmentResolved: false,
      hasMilestoneTriggered: false,
      hasPendingSuggestion: false,
      objectiveProgressDelta: 0,
      isNewLocation: false,
      hasActiveWorldEvent: false,
    });

    expect(result.hasMoodConflict).toBe(false);
  });

  it('accumulates multiple conditions', () => {
    const result = classifyNarrativeState('visit_known', 10, -2, {
      hasOtherCharacter: true,
      hasInteraction: true,
      hasCommitmentResolved: false,
      hasMilestoneTriggered: false,
      hasPendingSuggestion: false,
      objectiveProgressDelta: 0,
      isNewLocation: false,
      hasActiveWorldEvent: false,
    });

    expect(result.conditions.length).toBeGreaterThanOrEqual(3);
  });
});
