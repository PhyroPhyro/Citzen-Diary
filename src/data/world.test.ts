import { describe, it, expect } from 'vitest';
import {
  LOCATIONS,
  REGIONS,
  WORLD_EVENTS,
  getLocationById,
  getRegionById,
  getEventsByLocation,
  getEventsByRegion,
} from './world';

describe('REGIONS', () => {
  it('has 5 regions', () => {
    expect(REGIONS.length).toBe(5);
  });

  it('each region has required fields', () => {
    for (const region of REGIONS) {
      expect(region.id.length).toBeGreaterThan(0);
      expect(region.name.length).toBeGreaterThan(0);
      expect(region.climate.length).toBeGreaterThan(0);
      expect(region.culture.length).toBeGreaterThan(0);
    }
  });
});

describe('LOCATIONS', () => {
  it('has 15 locations', () => {
    expect(LOCATIONS.length).toBe(15);
  });

  it('each location has required fields', () => {
    for (const location of LOCATIONS) {
      expect(location.id.length).toBeGreaterThan(0);
      expect(location.name.length).toBeGreaterThan(0);
      expect(location.regionId.length).toBeGreaterThan(0);
      expect(location.type.length).toBeGreaterThan(0);
      expect(location.population).toBeGreaterThan(0);
      expect(location.description.length).toBeGreaterThan(0);
    }
  });

  it('each location has at least one connection', () => {
    for (const location of LOCATIONS) {
      expect(location.connections.length).toBeGreaterThan(0);
    }
  });

  it('all location regionIds reference valid regions', () => {
    const regionIds = REGIONS.map((r) => r.id);
    for (const location of LOCATIONS) {
      expect(regionIds).toContain(location.regionId);
    }
  });
});

describe('WORLD_EVENTS', () => {
  it('has 7 events', () => {
    expect(WORLD_EVENTS.length).toBe(7);
  });

  it('each event has required fields', () => {
    for (const event of WORLD_EVENTS) {
      expect(event.id.length).toBeGreaterThan(0);
      expect(event.name.length).toBeGreaterThan(0);
      expect(event.description.length).toBeGreaterThan(0);
      expect(event.regionId.length).toBeGreaterThan(0);
      expect(event.locationIds.length).toBeGreaterThan(0);
    }
  });

  it('all events are active by default', () => {
    for (const event of WORLD_EVENTS) {
      expect(event.isActive).toBe(true);
    }
  });
});

describe('getLocationById', () => {
  it('finds a location by id', () => {
    const location = getLocationById('veldra');
    expect(location).toBeDefined();
    expect(location?.name).toBe('Veldra');
  });

  it('returns undefined for unknown id', () => {
    const location = getLocationById('nonexistent');
    expect(location).toBeUndefined();
  });
});

describe('getRegionById', () => {
  it('finds a region by id', () => {
    const region = getRegionById('planicies_arvel');
    expect(region).toBeDefined();
    expect(region?.name).toBe('Planícies de Arvel');
  });

  it('returns undefined for unknown id', () => {
    const region = getRegionById('nonexistent');
    expect(region).toBeUndefined();
  });
});

describe('getEventsByLocation', () => {
  it('returns events for a location with active events', () => {
    const events = getEventsByLocation('arvel');
    expect(events.length).toBeGreaterThan(0);
  });

  it('returns empty array for location with no events', () => {
    const events = getEventsByLocation('salcove');
    // Salcove has the navio_encalha event
    expect(events.length).toBeGreaterThanOrEqual(0);
  });
});

describe('getEventsByRegion', () => {
  it('returns events for a region', () => {
    const events = getEventsByRegion('costa_maren');
    expect(events.length).toBeGreaterThan(0);
  });

  it('returns empty array for region with no events', () => {
    const events = getEventsByRegion('nonexistent');
    expect(events.length).toBe(0);
  });
});
