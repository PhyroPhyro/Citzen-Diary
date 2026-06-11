export interface RelationMemory {
    id: string;
    text: string;
    occurredAt: Date;
    locationId: string;
    taskId: string;
}
export type RelationType = 'conhecido' | 'amigo' | 'amigo_proximo' | 'rival' | 'inimigo' | 'parceiro_trabalho' | 'empregador' | 'empregado' | 'mentor' | 'aprendiz' | 'admirador' | 'admirado';
export interface Relation {
    id: string;
    characterId: string;
    targetId: string;
    targetType: 'npc' | 'player_character';
    targetName: string;
    relationType: RelationType;
    affinityScore: number;
    firstMetAt: Date;
    firstMetLocationId: string;
    lastInteractionAt: Date;
    interactionCount: number;
    memories: RelationMemory[];
}
export declare function affinityToModifier(affinity: number): number;
//# sourceMappingURL=relation.d.ts.map