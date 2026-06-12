import { describe, it, expect, beforeEach } from 'vitest';
import { executeCharacterTick, calculateTickInterval, shouldConvertToNPC } from '../../core/tick/character-tick';
import { Character } from '../../models';
import { MockLLMProvider } from '../../llm';
import { StubDBAdapter } from '../../db/stub-adapter';
import { StubQueueAdapter } from '../../queue/stub-adapter';

function createTestCharacter(overrides: Partial<Character> = {}): Character {
  const now = new Date();
  return {
    id: '__test__char-integration',
    name: '__test__ Integration Character',
    playerId: '__test__player',
    vocation: 'lavrador',
    position: null,
    bio: 'Test character for integration',
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
      progressScore: 0,
    },
    commitments: [],
    lastTickAt: now,
    nextTickAt: new Date(now.getTime() + 30 * 60 * 1000),
    lastPlayerLoginAt: now,
    isNpc: false,
    emergentSpecialization: null,
    richTickCount: 0,
    lastPrayAt: null,
    ...overrides,
  };
}

describe('Character Tick Integration', () => {
  let db: StubDBAdapter;
  let queue: StubQueueAdapter;
  let llm: MockLLMProvider;

  beforeEach(() => {
    db = new StubDBAdapter();
    queue = new StubQueueAdapter();
    llm = new MockLLMProvider();
  });

  it('executes a full tick and returns result', async () => {
    const character = createTestCharacter();
    const result = await executeCharacterTick(character, db, queue, llm);
    expect(result).not.toBeNull();
    expect(result?.chosenTask).toBeDefined();
    expect(result?.diaryEntry).toBeDefined();
  });

  it('updates objective progress after tick', async () => {
    const character = createTestCharacter({
      objective: {
        id: '__test__obj',
        description: 'Test objective',
        type: 'economic',
        difficulty: 2,
        progressScore: 50,
      },
    });
    const result = await executeCharacterTick(character, db, queue, llm);
    expect(result).not.toBeNull();
    expect(character.objective.progressScore).toBeGreaterThan(50);
  });

  it('does not exceed 100 progress score', async () => {
    const character = createTestCharacter({
      objective: {
        id: '__test__obj',
        description: 'Test objective',
        type: 'economic',
        difficulty: 2,
        progressScore: 98,
      },
    });
    const result = await executeCharacterTick(character, db, queue, llm);
    expect(result).not.toBeNull();
    expect(character.objective.progressScore).toBeLessThanOrEqual(100);
  });

  it('calls groupTrivialEntries during tick', async () => {
    const character = createTestCharacter();
    const result = await executeCharacterTick(character, db, queue, llm);
    expect(result).not.toBeNull();
  });

  it('calls reevaluateSpecialization during tick', async () => {
    const character = createTestCharacter();
    const result = await executeCharacterTick(character, db, queue, llm);
    expect(result).not.toBeNull();
  });
});
