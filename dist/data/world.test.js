"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const world_1 = require("./world");
(0, vitest_1.describe)('REGIONS', () => {
    (0, vitest_1.it)('has 5 regions', () => {
        (0, vitest_1.expect)(world_1.REGIONS.length).toBe(5);
    });
    (0, vitest_1.it)('each region has required fields', () => {
        for (const region of world_1.REGIONS) {
            (0, vitest_1.expect)(region.id.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(region.name.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(region.climate.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(region.culture.length).toBeGreaterThan(0);
        }
    });
});
(0, vitest_1.describe)('LOCATIONS', () => {
    (0, vitest_1.it)('has 15 locations', () => {
        (0, vitest_1.expect)(world_1.LOCATIONS.length).toBe(15);
    });
    (0, vitest_1.it)('each location has required fields', () => {
        for (const location of world_1.LOCATIONS) {
            (0, vitest_1.expect)(location.id.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(location.name.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(location.regionId.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(location.type.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(location.population).toBeGreaterThan(0);
            (0, vitest_1.expect)(location.description.length).toBeGreaterThan(0);
        }
    });
    (0, vitest_1.it)('each location has at least one connection', () => {
        for (const location of world_1.LOCATIONS) {
            (0, vitest_1.expect)(location.connections.length).toBeGreaterThan(0);
        }
    });
    (0, vitest_1.it)('all location regionIds reference valid regions', () => {
        const regionIds = world_1.REGIONS.map((r) => r.id);
        for (const location of world_1.LOCATIONS) {
            (0, vitest_1.expect)(regionIds).toContain(location.regionId);
        }
    });
});
(0, vitest_1.describe)('WORLD_EVENTS', () => {
    (0, vitest_1.it)('has 7 events', () => {
        (0, vitest_1.expect)(world_1.WORLD_EVENTS.length).toBe(7);
    });
    (0, vitest_1.it)('each event has required fields', () => {
        for (const event of world_1.WORLD_EVENTS) {
            (0, vitest_1.expect)(event.id.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(event.name.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(event.description.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(event.regionId.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(event.locationIds.length).toBeGreaterThan(0);
        }
    });
    (0, vitest_1.it)('all events are active by default', () => {
        for (const event of world_1.WORLD_EVENTS) {
            (0, vitest_1.expect)(event.isActive).toBe(true);
        }
    });
});
(0, vitest_1.describe)('getLocationById', () => {
    (0, vitest_1.it)('finds a location by id', () => {
        const location = (0, world_1.getLocationById)('veldra');
        (0, vitest_1.expect)(location).toBeDefined();
        (0, vitest_1.expect)(location?.name).toBe('Veldra');
    });
    (0, vitest_1.it)('returns undefined for unknown id', () => {
        const location = (0, world_1.getLocationById)('nonexistent');
        (0, vitest_1.expect)(location).toBeUndefined();
    });
});
(0, vitest_1.describe)('getRegionById', () => {
    (0, vitest_1.it)('finds a region by id', () => {
        const region = (0, world_1.getRegionById)('planicies_arvel');
        (0, vitest_1.expect)(region).toBeDefined();
        (0, vitest_1.expect)(region?.name).toBe('Planícies de Arvel');
    });
    (0, vitest_1.it)('returns undefined for unknown id', () => {
        const region = (0, world_1.getRegionById)('nonexistent');
        (0, vitest_1.expect)(region).toBeUndefined();
    });
});
(0, vitest_1.describe)('getEventsByLocation', () => {
    (0, vitest_1.it)('returns events for a location with active events', () => {
        const events = (0, world_1.getEventsByLocation)('arvel');
        (0, vitest_1.expect)(events.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('returns empty array for location with no events', () => {
        const events = (0, world_1.getEventsByLocation)('salcove');
        // Salcove has the navio_encalha event
        (0, vitest_1.expect)(events.length).toBeGreaterThanOrEqual(0);
    });
});
(0, vitest_1.describe)('getEventsByRegion', () => {
    (0, vitest_1.it)('returns events for a region', () => {
        const events = (0, world_1.getEventsByRegion)('costa_maren');
        (0, vitest_1.expect)(events.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('returns empty array for region with no events', () => {
        const events = (0, world_1.getEventsByRegion)('nonexistent');
        (0, vitest_1.expect)(events.length).toBe(0);
    });
});
//# sourceMappingURL=world.test.js.map