"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const milestone_system_1 = require("../npc/milestone-system");
function createMockCharacter(overrides = {}) {
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
        isNpc: false, specializations: [], visitedLocations: [], traitHistory: [], previousVocation: null,
        emergentSpecialization: null,
        richTickCount: 0,
        lastPrayAt: null,
        ...overrides,
    };
}
(0, vitest_1.describe)('Milestone System', () => {
    (0, vitest_1.describe)('checkMilestoneTriggers', () => {
        (0, vitest_1.it)('returns no triggers for normal tick', () => {
            const context = {
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
            const triggers = (0, milestone_system_1.checkMilestoneTriggers)(context);
            (0, vitest_1.expect)(triggers).toEqual([]);
        });
        (0, vitest_1.it)('triggers first_visit_new_location for new location', () => {
            const context = {
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
            const triggers = (0, milestone_system_1.checkMilestoneTriggers)(context);
            (0, vitest_1.expect)(triggers).toContain('first_visit_new_location');
        });
        (0, vitest_1.it)('triggers commitment_resolved when commitment resolved', () => {
            const context = {
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
            const triggers = (0, milestone_system_1.checkMilestoneTriggers)(context);
            (0, vitest_1.expect)(triggers).toContain('commitment_resolved');
        });
        (0, vitest_1.it)('triggers specialization_consolidated at richTickCount multiples of 5', () => {
            const context = {
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
            const triggers = (0, milestone_system_1.checkMilestoneTriggers)(context);
            (0, vitest_1.expect)(triggers).toContain('specialization_consolidated');
        });
        (0, vitest_1.it)('triggers world_event_impact when active event', () => {
            const context = {
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
            const triggers = (0, milestone_system_1.checkMilestoneTriggers)(context);
            (0, vitest_1.expect)(triggers).toContain('world_event_impact');
        });
        (0, vitest_1.it)('triggers lasting_mood_change when faith >= 8', () => {
            const context = {
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
            const triggers = (0, milestone_system_1.checkMilestoneTriggers)(context);
            (0, vitest_1.expect)(triggers).toContain('lasting_mood_change');
        });
        (0, vitest_1.it)('triggers first_commitment when character has exactly 1 commitment', () => {
            const context = {
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
            const triggers = (0, milestone_system_1.checkMilestoneTriggers)(context);
            (0, vitest_1.expect)(triggers).toContain('first_commitment');
        });
        (0, vitest_1.it)('triggers specialization_consolidated when emergentSpecialization exists', () => {
            const context = {
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
            const triggers = (0, milestone_system_1.checkMilestoneTriggers)(context);
            (0, vitest_1.expect)(triggers).toContain('specialization_consolidated');
        });
    });
    (0, vitest_1.describe)('getMilestoneImportance', () => {
        (0, vitest_1.it)('returns decisive for critical triggers', () => {
            (0, vitest_1.expect)((0, milestone_system_1.getMilestoneImportance)('position_gained')).toBe('decisive');
            (0, vitest_1.expect)((0, milestone_system_1.getMilestoneImportance)('position_lost')).toBe('decisive');
            (0, vitest_1.expect)((0, milestone_system_1.getMilestoneImportance)('objective_achieved')).toBe('decisive');
            (0, vitest_1.expect)((0, milestone_system_1.getMilestoneImportance)('relationship_broken')).toBe('decisive');
            (0, vitest_1.expect)((0, milestone_system_1.getMilestoneImportance)('critical_survival')).toBe('decisive');
        });
        (0, vitest_1.it)('returns relevant for significant triggers', () => {
            (0, vitest_1.expect)((0, milestone_system_1.getMilestoneImportance)('arrival_high_weight_location')).toBe('relevant');
            (0, vitest_1.expect)((0, milestone_system_1.getMilestoneImportance)('commitment_resolved')).toBe('relevant');
            (0, vitest_1.expect)((0, milestone_system_1.getMilestoneImportance)('specialization_consolidated')).toBe('relevant');
            (0, vitest_1.expect)((0, milestone_system_1.getMilestoneImportance)('world_event_impact')).toBe('relevant');
            (0, vitest_1.expect)((0, milestone_system_1.getMilestoneImportance)('lasting_mood_change')).toBe('relevant');
        });
        (0, vitest_1.it)('returns minor for other triggers', () => {
            (0, vitest_1.expect)((0, milestone_system_1.getMilestoneImportance)('first_visit_new_location')).toBe('minor');
            (0, vitest_1.expect)((0, milestone_system_1.getMilestoneImportance)('first_commitment')).toBe('minor');
            (0, vitest_1.expect)((0, milestone_system_1.getMilestoneImportance)('first_npc_interaction')).toBe('minor');
        });
    });
});
//# sourceMappingURL=milestone-system.test.js.map