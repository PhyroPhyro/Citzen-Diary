import { describe, it, expect } from 'vitest';
import {
  generateNPCName,
  generateDefaultProfile,
  shouldAutoNameNPC,
  autoNameNPC,
  calculateAffinityDecay,
  applyAffinityDecay,
  addRelationMemory,
  getRelationType,
} from '../npc/npc-system';
import { NPC, Relation } from '../../models';

describe('NPC System', () => {
  describe('generateNPCName', () => {
    it('generates a name with first and last', () => {
      const name = generateNPCName();
      expect(name.firstName).toBeDefined();
      expect(name.lastName).toBeDefined();
      expect(name.fullName).toContain(' ');
    });

    it('generates different names on multiple calls', () => {
      const names = new Set();
      for (let i = 0; i < 20; i++) {
        names.add(generateNPCName().fullName);
      }
      expect(names.size).toBeGreaterThan(1);
    });
  });

  describe('generateDefaultProfile', () => {
    it('generates a profile with all fields', () => {
      const profile = generateDefaultProfile({ locationId: 'veldra' });
      expect(profile.occupation).toBeDefined();
      expect(profile.dominantTrait).toBeDefined();
      expect(profile.physicalDescription).toBeDefined();
      expect(profile.firstImpression).toBeDefined();
    });

    it('uses trait bias when provided', () => {
      const profile = generateDefaultProfile({
        locationId: 'veldra',
        traitBias: 'calmo',
      });
      expect(profile.dominantTrait).toBe('calmo');
    });
  });

  describe('shouldAutoNameNPC', () => {
    it('returns false if NPC is named by player', () => {
      const npc: Partial<NPC> = {
        isNamedByPlayer: true,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      };
      expect(shouldAutoNameNPC(npc as NPC)).toBe(false);
    });

    it('returns false if NPC is less than 24h old', () => {
      const npc: Partial<NPC> = {
        isNamedByPlayer: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      };
      expect(shouldAutoNameNPC(npc as NPC)).toBe(false);
    });

    it('returns true if NPC is 24h+ old and not named', () => {
      const npc: Partial<NPC> = {
        isNamedByPlayer: false,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      };
      expect(shouldAutoNameNPC(npc as NPC)).toBe(true);
    });
  });

  describe('autoNameNPC', () => {
    it('returns existing name if already named by player', () => {
      const npc: Partial<NPC> = {
        name: 'Aldric',
        isNamedByPlayer: true,
      };
      expect(autoNameNPC(npc as NPC)).toBe('Aldric');
    });

    it('generates a new name for unnamed NPC', () => {
      const npc: Partial<NPC> = {
        name: 'Desconhecido',
        isNamedByPlayer: false,
      };
      const newName = autoNameNPC(npc as NPC);
      expect(newName).not.toBe('Desconhecido');
      expect(newName).toContain(' ');
    });
  });

  describe('calculateAffinityDecay', () => {
    it('returns 0 for less than 24h', () => {
      expect(calculateAffinityDecay(12)).toBe(0);
    });

    it('returns -1 for 24-48h', () => {
      expect(calculateAffinityDecay(36)).toBe(-1);
    });

    it('returns -2 for 48-168h', () => {
      expect(calculateAffinityDecay(100)).toBe(-2);
    });

    it('returns -3 for 168h+', () => {
      expect(calculateAffinityDecay(200)).toBe(-3);
    });
  });

  describe('applyAffinityDecay', () => {
    it('applies decay based on last interaction time', () => {
      const relation: Partial<Relation> = {
        affinityScore: 50,
        lastInteractionAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
        memories: [],
      };
      const newAffinity = applyAffinityDecay(relation as Relation);
      expect(newAffinity).toBe(49);
    });

    it('does not go below -100', () => {
      const relation: Partial<Relation> = {
        affinityScore: -98,
        lastInteractionAt: new Date(Date.now() - 200 * 60 * 60 * 1000),
        memories: [],
      };
      const newAffinity = applyAffinityDecay(relation as Relation);
      expect(newAffinity).toBe(-100);
    });
  });

  describe('addRelationMemory', () => {
    it('adds a memory to the relation', () => {
      const relation: Relation = {
        id: 'rel-1',
        characterId: 'char-1',
        targetId: 'npc-1',
        targetType: 'npc',
        targetName: 'Test NPC',
        relationType: 'conhecido',
        affinityScore: 0,
        firstMetAt: new Date(),
        firstMetLocationId: 'veldra',
        lastInteractionAt: new Date(),
        interactionCount: 0,
        memories: [],
      };

      const updated = addRelationMemory(relation, {
        text: 'We met at the tavern',
        occurredAt: new Date(),
        locationId: 'tavern',
        taskId: 'talk',
      });

      expect(updated.memories.length).toBe(1);
      expect(updated.memories[0].text).toBe('We met at the tavern');
    });
  });

  describe('getRelationType', () => {
    it('returns amigo_proximo for high affinity', () => {
      expect(getRelationType(80)).toBe('amigo_proximo');
      expect(getRelationType(100)).toBe('amigo_proximo');
    });

    it('returns amigo for medium-high affinity', () => {
      expect(getRelationType(50)).toBe('amigo');
      expect(getRelationType(79)).toBe('amigo');
    });

    it('returns conhecido for positive affinity', () => {
      expect(getRelationType(20)).toBe('conhecido');
      expect(getRelationType(49)).toBe('conhecido');
    });

    it('returns parceiro_trabalho for neutral', () => {
      expect(getRelationType(0)).toBe('parceiro_trabalho');
      expect(getRelationType(19)).toBe('parceiro_trabalho');
    });

    it('returns rival for negative affinity', () => {
      expect(getRelationType(-20)).toBe('rival');
      expect(getRelationType(-1)).toBe('rival');
    });

    it('returns inimigo for very negative affinity', () => {
      expect(getRelationType(-21)).toBe('inimigo');
      expect(getRelationType(-100)).toBe('inimigo');
    });
  });
});
