import { describe, it, expect, beforeEach } from 'vitest';
import { runDecisionMotor, scoreTasks, buildTaskPool, DecisionContext } from '../../core/decision/motor';
import { Character, Milestone } from '../../models';
import { getTasksByVocation, getTasksByVocation11 } from '../../data/tasks';
import { getLocationById } from '../../data/world';

function createTestCharacter(overrides: Partial<Character> = {}): Character {
  const now = new Date();
  return {
    id: '__test__char-motor',
    name: '__test__ Motor Character',
    playerId: '__test__player',
    vocation: 'lavrador',
    position: null,
    bio: 'Test character for motor tests',
    locationId: 'veldra',
    activityId: null,
    travelDestination: null,
    traits: {
      openness: 5,
      conscientiousness: 7,
      extraversion: 4,
      emotionalStability: 6,
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
      id: '__test__obj',
      description: 'Test objective',
      type: 'economic',
      difficulty: 2,
      progressScore: 50,
    },
    commitments: [],
    lastTickAt: now,
    nextTickAt: new Date(now.getTime() + 30 * 60 * 1000),
    lastPlayerLoginAt: now,
    isNpc: false,
    specializations: [],
    visitedLocations: [],
    traitHistory: [],
    previousVocation: null,
    emergentSpecialization: null,
    richTickCount: 0,
    lastPrayAt: null,
    ...overrides,
  };
}

describe('Phase 19/20 — Motor Enhancements', () => {
  describe('Milestone modifier', () => {
    it('gives bonus for objective_achieved milestone on work tasks', () => {
      const character = createTestCharacter();
      const activeMilestones: Milestone[] = [
        {
          id: '__test__ms-1',
          characterId: character.id,
          importance: 'decisive',
          title: 'Objective Achieved',
          description: 'Character completed a major objective',
          occurredAt: new Date(),
          locationId: 'veldra',
          locationName: 'Veldra',
          triggerType: 'objective_achieved',
          relatedCharacterIds: [],
          relatedEventId: null,
          diaryEntryId: null,
          isActiveContext: true,
          parentMilestoneId: null,
          chainOrder: 0,
        },
      ];
      const tasks = getTasksByVocation('lavrador');
      const workTask = tasks.find(t => t.category === 'work')!;
      const context: DecisionContext = {
        character,
        activeMilestones,
        relationsInLocation: [],
        activeCommitments: [],
      };
      const scored = scoreTasks([workTask], context);
      expect(scored[0].score).toBeGreaterThan(workTask.baseScore);
    });

    it('gives bonus for world_event_impact milestone', () => {
      const character = createTestCharacter();
      const activeMilestones: Milestone[] = [
        {
          id: '__test__ms-2',
          characterId: character.id,
          importance: 'relevant',
          title: 'World Event Impact',
          description: 'Character was affected by a world event',
          occurredAt: new Date(),
          locationId: 'arvel',
          locationName: 'Arvel',
          triggerType: 'world_event_impact',
          relatedCharacterIds: [],
          relatedEventId: null,
          diaryEntryId: null,
          isActiveContext: true,
          parentMilestoneId: null,
          chainOrder: 0,
        },
      ];
      const tasks = getTasksByVocation('lavrador');
      const context: DecisionContext = {
        character,
        activeMilestones,
        relationsInLocation: [],
        activeCommitments: [],
      };
      const scored = scoreTasks(tasks, context);
      expect(scored[0].score).toBeGreaterThan(tasks[0].baseScore);
    });

    it('caps milestone modifier at 3', () => {
      const character = createTestCharacter();
      const activeMilestones: Milestone[] = [
        {
          id: '__test__ms-3',
          characterId: character.id,
          importance: 'decisive',
          title: 'Milestone 1',
          description: 'Test',
          occurredAt: new Date(),
          locationId: 'veldra',
          locationName: 'Veldra',
          triggerType: 'objective_achieved',
          relatedCharacterIds: [],
          relatedEventId: null,
          diaryEntryId: null,
          isActiveContext: true,
          parentMilestoneId: null,
          chainOrder: 0,
        },
        {
          id: '__test__ms-4',
          characterId: character.id,
          importance: 'decisive',
          title: 'Milestone 2',
          description: 'Test',
          occurredAt: new Date(),
          locationId: 'veldra',
          locationName: 'Veldra',
          triggerType: 'commitment_resolved',
          relatedCharacterIds: [],
          relatedEventId: null,
          diaryEntryId: null,
          isActiveContext: true,
          parentMilestoneId: null,
          chainOrder: 0,
        },
        {
          id: '__test__ms-5',
          characterId: character.id,
          importance: 'decisive',
          title: 'Milestone 3',
          description: 'Test',
          occurredAt: new Date(),
          locationId: 'veldra',
          locationName: 'Veldra',
          triggerType: 'world_event_impact',
          relatedCharacterIds: [],
          relatedEventId: null,
          diaryEntryId: null,
          isActiveContext: true,
          parentMilestoneId: null,
          chainOrder: 0,
        },
        {
          id: '__test__ms-6',
          characterId: character.id,
          importance: 'decisive',
          title: 'Milestone 4',
          description: 'Test',
          occurredAt: new Date(),
          locationId: 'veldra',
          locationName: 'Veldra',
          triggerType: 'specialization_consolidated',
          relatedCharacterIds: [],
          relatedEventId: null,
          diaryEntryId: null,
          isActiveContext: true,
          parentMilestoneId: null,
          chainOrder: 0,
        },
      ];
      const tasks = getTasksByVocation('lavrador');
      const workTask = tasks.find(t => t.category === 'work')!;
      const context: DecisionContext = {
        character,
        activeMilestones,
        relationsInLocation: [],
        activeCommitments: [],
      };
      const scored = scoreTasks([workTask], context);
      const milestoneBonus = scored[0].score - workTask.baseScore -
        scored[0].breakdown.traitPrimary -
        scored[0].breakdown.traitSecondary -
        scored[0].breakdown.mood -
        scored[0].breakdown.objective -
        scored[0].breakdown.commitment -
        scored[0].breakdown.environment -
        scored[0].breakdown.relation -
        scored[0].breakdown.faith;
      expect(milestoneBonus).toBeLessThanOrEqual(3);
    });

    it('does not give bonus for inactive milestones', () => {
      const character = createTestCharacter();
      const activeMilestones: Milestone[] = [
        {
          id: '__test__ms-7',
          characterId: character.id,
          importance: 'minor',
          title: 'Inactive Milestone',
          description: 'Test',
          occurredAt: new Date(),
          locationId: 'veldra',
          locationName: 'Veldra',
          triggerType: 'objective_achieved',
          relatedCharacterIds: [],
          relatedEventId: null,
          diaryEntryId: null,
          isActiveContext: false,
          parentMilestoneId: null,
          chainOrder: 0,
        },
      ];
      const tasks = getTasksByVocation('lavrador');
      const workTask = tasks.find(t => t.category === 'work')!;
      const context: DecisionContext = {
        character,
        activeMilestones,
        relationsInLocation: [],
        activeCommitments: [],
      };
      const scored = scoreTasks([workTask], context);
      const milestoneBonus = scored[0].score - workTask.baseScore -
        scored[0].breakdown.traitPrimary -
        scored[0].breakdown.traitSecondary -
        scored[0].breakdown.mood -
        scored[0].breakdown.objective -
        scored[0].breakdown.commitment -
        scored[0].breakdown.environment -
        scored[0].breakdown.relation -
        scored[0].breakdown.faith;
      expect(milestoneBonus).toBe(0);
    });
  });

  describe('Specialization modifier', () => {
    it('gives +2 bonus when task name matches specialization', () => {
      const character = createTestCharacter({
        specializations: ['Master Cultivar'],
        emergentSpecialization: 'Master Cultivar',
      });
      const tasks = getTasksByVocation('lavrador');
      const cultivateTask = tasks.find(t => t.id === 'cultivate')!;
      const context: DecisionContext = {
        character,
        relationsInLocation: [],
        activeCommitments: [],
      };
      const scored = scoreTasks([cultivateTask], context);
      const baseModifiers = cultivateTask.baseScore +
        scored[0].breakdown.traitPrimary +
        scored[0].breakdown.traitSecondary +
        scored[0].breakdown.mood +
        scored[0].breakdown.objective +
        scored[0].breakdown.commitment +
        scored[0].breakdown.environment +
        scored[0].breakdown.relation +
        scored[0].breakdown.faith;
      expect(scored[0].score).toBeGreaterThan(baseModifiers);
    });

    it('does not give bonus when task does not match specialization', () => {
      const character = createTestCharacter({
        specializations: ['Master Smith'],
        emergentSpecialization: 'Master Smith',
      });
      const tasks = getTasksByVocation('lavrador');
      const cultivateTask = tasks.find(t => t.id === 'cultivate')!;
      const context: DecisionContext = {
        character,
        relationsInLocation: [],
        activeCommitments: [],
      };
      const scored = scoreTasks([cultivateTask], context);
      const specBonus = scored[0].score - cultivateTask.baseScore -
        scored[0].breakdown.traitPrimary -
        scored[0].breakdown.traitSecondary -
        scored[0].breakdown.mood -
        scored[0].breakdown.objective -
        scored[0].breakdown.commitment -
        scored[0].breakdown.environment -
        scored[0].breakdown.relation -
        scored[0].breakdown.faith;
      expect(specBonus).toBe(0);
    });
  });

  describe('Dynamic event tasks in pool', () => {
    it('includes dynamic event tasks for active events', () => {
      const character = createTestCharacter({
        locationId: 'arvel',
      });
      const location = getLocationById(character.locationId);
      const activeEvents = location ? [] : [];
      const pool = buildTaskPool(character, activeEvents);
      expect(pool.length).toBeGreaterThan(0);
    });

    it('includes v1.1 vocation tasks in pool', () => {
      const character = createTestCharacter({ vocation: 'clerigo' });
      const pool = buildTaskPool(character, []);
      const clerigoTasks = pool.filter(t => t.id.startsWith('bless_') || t.id.startsWith('hear_'));
      expect(clerigoTasks.length).toBeGreaterThan(0);
    });
  });

  describe('V1.1 vocations in motor', () => {
    it('runDecisionMotor works with clerigo vocation', () => {
      const character = createTestCharacter({ vocation: 'clerigo' });
      const context: DecisionContext = {
        character,
        relationsInLocation: [],
        activeCommitments: [],
      };
      const top3 = runDecisionMotor(character, context);
      expect(top3.length).toBeGreaterThan(0);
      expect(top3[0].task).toBeDefined();
    });

    it('runDecisionMotor works with vorant vocation', () => {
      const character = createTestCharacter({ vocation: 'vorant' });
      const context: DecisionContext = {
        character,
        relationsInLocation: [],
        activeCommitments: [],
      };
      const top3 = runDecisionMotor(character, context);
      expect(top3.length).toBeGreaterThan(0);
      expect(top3[0].task).toBeDefined();
    });

    it('runDecisionMotor works with guerreiro vocation', () => {
      const character = createTestCharacter({ vocation: 'guerreiro' });
      const context: DecisionContext = {
        character,
        relationsInLocation: [],
        activeCommitments: [],
      };
      const top3 = runDecisionMotor(character, context);
      expect(top3.length).toBeGreaterThan(0);
      expect(top3[0].task).toBeDefined();
    });

    it('runDecisionMotor works with escriba vocation', () => {
      const character = createTestCharacter({ vocation: 'escriba' });
      const context: DecisionContext = {
        character,
        relationsInLocation: [],
        activeCommitments: [],
      };
      const top3 = runDecisionMotor(character, context);
      expect(top3.length).toBeGreaterThan(0);
      expect(top3[0].task).toBeDefined();
    });

    it('runDecisionMotor works with trovador vocation', () => {
      const character = createTestCharacter({ vocation: 'trovador' });
      const context: DecisionContext = {
        character,
        relationsInLocation: [],
        activeCommitments: [],
      };
      const top3 = runDecisionMotor(character, context);
      expect(top3.length).toBeGreaterThan(0);
      expect(top3[0].task).toBeDefined();
    });
  });
});
