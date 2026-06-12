export interface Character {
    id: string;
    name: string;
    playerId: string;
    vocation: string;
    position: string | null;
    bio: string;
    locationId: string;
    activityId: string | null;
    travelDestination: string | null;
    traits: {
        openness: number;
        conscientiousness: number;
        extraversion: number;
        emotionalStability: number;
        agreeableness: number;
    };
    mood: {
        joy: number;
        sadness: number;
        anger: number;
        fear: number;
        disgust: number;
        surprise: number;
    };
    faith: number;
    objective: {
        id: string;
        description: string;
        type: string;
        difficulty: number;
        progressScore: number;
    };
    commitments: {
        id: string;
        description: string;
        deadline: Date;
        urgency: string;
    }[];
    lastTickAt: Date;
    nextTickAt: Date;
    lastPlayerLoginAt: Date;
    isNpc: boolean;
    emergentSpecialization: string | null;
    specializations: string[];
    richTickCount: number;
    lastPrayAt: Date | null;
    visitedLocations: string[];
    traitHistory: {
        trait: string;
        oldValue: number;
        newValue: number;
        changedAt: Date;
    }[];
    previousVocation: string | null;
}
export interface CharacterStatus {
    name: string;
    vocation: string;
    emergentSpecialization: string | null;
    position: string | null;
    locationId: string;
    locationName: string;
    currentActivity: string;
    travelDestination: string | null;
    estimatedArrival: Date | null;
    moodState: string;
    moodValues: {
        joy: number;
        sadness: number;
        anger: number;
        fear: number;
        disgust: number;
        surprise: number;
    };
    objectiveType: string;
    objectiveProgress: number;
    activeCommitments: {
        description: string;
        deadline: Date;
        urgency: 'low' | 'medium' | 'high';
    }[];
    faith: number;
    lastTickAt: Date;
    nextTickAt: Date;
    lastPlayerLoginAt: Date;
    isNpc: boolean;
    lastAction: string;
    lastActionResult: string;
    lastDiaryEntryAt: Date;
}
//# sourceMappingURL=character.d.ts.map