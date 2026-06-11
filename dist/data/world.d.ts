export interface Location {
    id: string;
    name: string;
    regionId: string;
    type: string;
    population: number;
    description: string;
    connections: {
        locationId: string;
        travelDays: number;
    }[];
}
export interface Region {
    id: string;
    name: string;
    climate: string;
    culture: string;
    dominantPower: string;
    narrativeTone: string;
}
export interface WorldEvent {
    id: string;
    name: string;
    description: string;
    regionId: string;
    locationIds: string[];
    isActive: boolean;
}
export declare const REGIONS: Region[];
export declare const LOCATIONS: Location[];
export declare const WORLD_EVENTS: WorldEvent[];
export declare function getLocationById(id: string): Location | undefined;
export declare function getRegionById(id: string): Region | undefined;
export declare function getEventsByLocation(locationId: string): WorldEvent[];
export declare function getEventsByRegion(regionId: string): WorldEvent[];
//# sourceMappingURL=world.d.ts.map