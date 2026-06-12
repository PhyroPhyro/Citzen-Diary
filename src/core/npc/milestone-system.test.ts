import { describe, it, expect } from 'vitest';
import {
  checkMilestoneTriggers,
  getMilestoneImportance,
  MilestoneCheckContext,
} from '../npc/milestone-system';
import { Character, MilestoneTrigger } from '../../models';

function createMockCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-1',
    name: 'Test Character',
    playerId: 'player-1',
    vocation: 'andarilho',
    position: null,
    bio: 'Test bio',
    locationId: 'veldra',
    activityId: null,
    travelDestination: null,
    traits: {
      openness: 5,
      conscientiousness: 5,
      extraversion: 5,
      emotionalStability: 5,
      agreeableness: 5,
    },
    mood: {
      joy: 5,
      sadness: 2,
      anger: 1,
      fear: 2,
      disgust: 1,
      surprise: 3,
    },
    faith: 5,
    objective: {
      id: 'obj-1',
      description: 'Test objective',
      type: 'exploratory',
      difficulty: 1,
      progressScore: 0,
    },
    commitments: [],
    lastTickAt: new Date(),
    nextTickAt: new Date(),
    lastPlayerLoginAt: new Date(),
    isNpc: false,
    emergentSpecialization: null,
    richTickCount: 0,
    lastPrayAt: null,
    ...overrides,
  };
}

describe('Milestone System', () => {
  describe('checkMilestoneTriggers', () => {
    it('returns no triggers for normal tick', () => {
      const context: MilestoneCheckContext = {
        character: createMockCharacter(),
        taskId: 'walk',
        score: 10,
        locationId: 'veldra',
        hasPendingSuggestion: false,
        wasFollowed: false,
        isNewLocation: false,
        hasActiveWorldEvent: false,
        moodState: 'neutro',
        commitmentResolved: false,
      };

      const triggers = checkMilestoneTriggers(context);
      expect(triggers).toEqual([]);
    });

    it('triggers first_visit_new_location for new location', () => {
      const context: MilestoneCheckContext = {
        character: createMockCharacter(),
        taskId: 'walk',
        score: 10,
        locationId: 'arvel',
        hasPendingSuggestion: false,
        wasFollowed: false,
        isNewLocation: true,
        hasActiveWorldEvent: false,
        moodState: 'neutro',
        commitmentResolved: false,
      };

      const triggers = checkMilestoneTriggers(context);
      expect(triggers).toContain('first_visit_new_location');
    });

    it('triggers commitment_resolved when commitment resolved', () => {
      const context: MilestoneCheckContext = {
        character: createMockCharacter(),
        taskId: 'walk',
        score: 10,
        locationId: 'veldra',
        hasPendingSuggestion: false,
        wasFollowed: false,
        isNewLocation: false,
        hasActiveWorldEvent: false,
        moodState: 'neutro',
        commitmentResolved: true,
      };

      const triggers = checkMilestoneTriggers(context);
      expect(triggers).toContain('commitment_resolved');
    });

    it('triggers specialization_consolidated at richTickCount multiples of 5', () => {
      const context: MilestoneCheckContext = {
        character: createMockCharacter({ richTickCount: 5 }),
        taskId: 'walk',
        score: 10,
        locationId: 'veldra',
        hasPendingSuggestion: false,
        wasFollowed: false,
        isNewLocation: false,
        hasActiveWorldEvent: false,
        moodState: 'neutro',
        commitmentResolved: false,
      };

      const triggers = checkMilestoneTriggers(context);
      expect(triggers).toContain('specialization_consolidated');
    });

    it('triggers world_event_impact when active event', () => {
      const context: MilestoneCheckContext = {
        character: createMockCharacter(),
        taskId: 'walk',
        score: 10,
        locationId: 'veldra',
        hasPendingSuggestion: false,
        wasFollowed: false,
        isNewLocation: false,
        hasActiveWorldEvent: true,
        moodState: 'neutro',
        commitmentResolved: false,
      };

      const triggers = checkMilestoneTriggers(context);
      expect(triggers).toContain('world_event_impact');
    });

    it('triggers lasting_mood_change when faith >= 8', () => {
      const context: MilestoneCheckContext = {
        character: createMockCharacter({ faith: 8 }),
        taskId: 'walk',
        score: 10,
        locationId: 'veldra',
        hasPendingSuggestion: false,
        wasFollowed: false,
        isNewLocation: false,
        hasActiveWorldEvent: false,
        moodState: 'neutro',
        commitmentResolved: false,
      };

      const triggers = checkMilestoneTriggers(context);
      expect(triggers).toContain('lasting_mood_change');
    });

    it('triggers first_commitment when character has exactly 1 commitment', () => {
      const context: MilestoneCheckContext = {
        character: createMockCharacter({
          commitments: [{
            id: 'commit-1',
            description: 'Test commitment',
            deadline: new Date(),
            urgency: 'medium',
          }],
        }),
        taskId: 'walk',
        score: 10,
        locationId: 'veldra',
        hasPendingSuggestion: false,
        wasFollowed: false,
        isNewLocation: false,
        hasActiveWorldEvent: false,
        moodState: 'neutro',
        commitmentResolved: false,
      };

      const triggers = checkMilestoneTriggers(context);
      expect(triggers).toContain('first_commitment');
    });

    it('triggers specialization_consolidated when emergentSpecialization exists', () => {
      const context: MilestoneCheckContext = {
        character: createMockCharacter({ emergentSpecialization: 'Expert Walker' }),
        taskId: 'walk',
        score: 10,
        locationId: 'veldra',
        hasPendingSuggestion: false,
        wasFollowed: false,
        isNewLocation: false,
        hasActiveWorldEvent: false,
        moodState: 'neutro',
        commitmentResolved: false,
      };

      const triggers = checkMilestoneTriggers(context);
      expect(triggers).toContain('specialization_consolidated');
    });
  });

  describe('getMilestoneImportance', () => {
    it('returns decisive for critical triggers', () => {
      expect(getMilestoneImportance('position_gained')).toBe('decisive');
      expect(getMilestoneImportance('position_lost')).toBe('decisive');
      expect(getMilestoneImportance('objective_achieved')).toBe('decisive');
      expect(getMilestoneImportance('relationship_broken')).toBe('decisive');
      expect(getMilestoneImportance('critical_survival')).toBe('decisive');
    });

    it('returns relevant for significant triggers', () => {
      expect(getMilestoneImportance('arrival_high_weight_location')).toBe('relevant');
      expect(getMilestoneImportance('commitment_resolved')).toBe('relevant');
      expect(getMilestoneImportance('specialization_consolidated')).toBe('relevant');
      expect(getMilestoneImportance('world_event_impact')).toBe('relevant');
      expect(getMilestoneImportance('lasting_mood_change')).toBe('relevant');
    });

    it('returns minor for other triggers', () => {
      expect(getMilestoneImportance('first_visit_new_location')).toBe('minor');
      expect(getMilestoneImportance('first_commitment')).toBe('minor');
      expect(getMilestoneImportance('first_npc_interaction')).toBe('minor');
    });
  });
});
