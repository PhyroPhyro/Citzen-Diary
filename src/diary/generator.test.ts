import { describe, it, expect } from 'vitest';
import { generateTemplateEntry } from './generator';
import { Character } from '../models';

function createTestCharacter(): Character {
  return {
    id: 'test-char-1',
    name: 'Test Character',
    playerId: 'player-1',
    vocation: 'lavrador',
    position: null,
    bio: 'A test character',
    locationId: 'veldra',
    activityId: null,
    travelDestination: null,
    traits: {
      openness: 5,
      conscientiousness: 8,
      extraversion: 3,
      emotionalStability: 6,
      agreeableness: 5,
    },
    mood: {
      joy: 7,
      sadness: 1,
      anger: 1,
      fear: 1,
      disgust: 1,
      surprise: 2,
    },
    faith: 5,
    objective: {
      id: 'obj-1',
      description: 'Test objective',
      type: 'economic',
      difficulty: 2,
      progressScore: 30,
    },
    commitments: [],
    lastTickAt: new Date(),
    nextTickAt: new Date(),
    lastPlayerLoginAt: new Date(),
    isNpc: false, specializations: [], visitedLocations: [], traitHistory: [], previousVocation: null,
    emergentSpecialization: null,
    richTickCount: 0,
    lastPrayAt: null,
  };
}

describe('generateTemplateEntry', () => {
  it('generates a diary entry for a known task', () => {
    const character = createTestCharacter();
    const entry = generateTemplateEntry(character, { id: 'cultivate', name: 'Cultivar / Plantar' });

    expect(entry.id).toBeDefined();
    expect(entry.characterId).toBe(character.id);
    expect(entry.text.length).toBeGreaterThan(0);
    expect(entry.source).toBe('template');
    expect(entry.taskId).toBe('cultivate');
    expect(entry.isGrouped).toBe(false);
    expect(entry.groupCount).toBeNull();
    expect(entry.isAnchored).toBe(false);
  });

  it('generates a diary entry for an unknown task', () => {
    const character = createTestCharacter();
    const entry = generateTemplateEntry(character, { id: 'unknown_task', name: 'Unknown Task' });

    expect(entry.text.length).toBeGreaterThan(0);
    expect(entry.source).toBe('template');
  });

  it('includes positive suffix for happy mood', () => {
    const character = createTestCharacter();
    character.mood = { joy: 9, sadness: 1, anger: 1, fear: 1, disgust: 1, surprise: 1 };

    const entry = generateTemplateEntry(character, { id: 'cultivate', name: 'Cultivar / Plantar' });
    expect(entry.moodState).toBe('animado');
  });

  it('includes negative suffix for sad mood', () => {
    const character = createTestCharacter();
    character.mood = { joy: 1, sadness: 9, anger: 1, fear: 1, disgust: 1, surprise: 1 };

    const entry = generateTemplateEntry(character, { id: 'cultivate', name: 'Cultivar / Plantar' });
    expect(entry.moodState).toBe('melancolico');
  });

  it('generates entry for rest task', () => {
    const character = createTestCharacter();
    const entry = generateTemplateEntry(character, { id: 'rest', name: 'Descansar' });

    expect(entry.text.length).toBeGreaterThan(0);
    expect(entry.taskId).toBe('rest');
  });

  it('generates entry for travel task', () => {
    const character = createTestCharacter();
    const entry = generateTemplateEntry(character, { id: 'deliver_message', name: 'Entregar Mensagem' });

    expect(entry.text.length).toBeGreaterThan(0);
    expect(entry.taskId).toBe('deliver_message');
  });
});
