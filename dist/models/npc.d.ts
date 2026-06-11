export interface NPC {
    id: string;
    name: string;
    namedByPlayerId: string;
    namedByPlayerName: string;
    namedAt: Date;
    locationId: string;
    occupation: string;
    dominantTrait: string;
    physicalDescription: string;
    firstImpression: string;
    isNamedByPlayer: boolean;
    createdAt: Date;
}
export interface NPCProfile {
    occupation: string;
    dominantTrait: string;
    physicalDescription: string;
    firstImpression: string;
}
//# sourceMappingURL=npc.d.ts.map