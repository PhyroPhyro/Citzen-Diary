export type MilestoneImportance = 'decisive' | 'relevant' | 'minor';
export type MilestoneTrigger = 'position_gained' | 'position_lost' | 'objective_achieved' | 'relationship_established' | 'relationship_broken' | 'trait_changed' | 'critical_survival' | 'arrival_high_weight_location' | 'commitment_resolved' | 'first_npc_interaction' | 'specialization_consolidated' | 'world_event_impact' | 'lasting_mood_change' | 'arrival_medium_weight_location' | 'first_visit_new_location' | 'first_exclusive_task' | 'small_economic_social_achievement' | 'first_commitment';
export interface Milestone {
    id: string;
    characterId: string;
    importance: MilestoneImportance;
    title: string;
    description: string;
    occurredAt: Date;
    locationId: string;
    locationName: string;
    triggerType: MilestoneTrigger;
    relatedCharacterIds: string[];
    relatedEventId: string | null;
    diaryEntryId: string | null;
    isActiveContext: boolean;
}
//# sourceMappingURL=milestone.d.ts.map