import { Router, Request, Response } from 'express';
import { DBAdapter } from '../db';
import { QueueAdapter } from '../queue';
import { LLMProvider } from '../llm';
import { REGIONS, LOCATIONS, WORLD_EVENTS } from '../data';
import { calculateTraits, CHARACTER_QUESTIONS } from '../data/questionnaire';
import { getDominantMood, DIARY_LIMIT } from '../models';
import { generateTemplateEntry } from '../diary';
import { z } from 'zod';
import { createNPCForLocation, processNPCDecay, processRelationDecay, generateNPCName } from '../core/npc/npc-system';
import { processMilestones, groupTrivialEntries, reevaluateSpecialization } from '../core/npc/milestone-system';

const router = Router();

interface AppDeps {
  db: DBAdapter;
  queue: QueueAdapter;
  llm: LLMProvider;
}

export function createRoutes(deps: AppDeps): Router {
  const { db, queue, llm } = deps;

  const getParamId = (req: Request): string => req.params.id as string;

  const CharacterCreateSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    playerId: z.string().min(1).max(100),
    vocation: z.enum(['lavrador', 'andarilho', 'aprendiz_artesao', 'aspirante_guarda', 'comerciante_ambulante']),
    answers: z.array(z.object({
      questionId: z.number(),
      optionLetter: z.string().length(1),
    })).min(10).max(10),
  });

  const SuggestionSchema = z.object({
    type: z.enum(['task', 'destination', 'vision']),
    taskId: z.string().optional(),
    locationId: z.string().optional(),
    text: z.string().max(200).optional(),
    message: z.string().max(500).optional().nullable(),
  });

  const PraySchema = z.object({
    characterId: z.string(),
  });

  const NameNpcSchema = z.object({
    npcId: z.string(),
    name: z.string().min(1).max(100),
  });

  const LoginSchema = z.object({
    playerId: z.string().min(1).max(100),
  });

  const MarkEntrySchema = z.object({
    entryId: z.string(),
  });

  const RenameMilestoneSchema = z.object({
    title: z.string().min(1).max(200),
  });

  router.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  router.get('/character/:id', async (req: Request, res: Response) => {
    try {
      const characterId = getParamId(req);
      const character = await db.character.getById(characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const dominantMood = getDominantMood(character.mood);
      const relations = await db.relations.getByCharacterId(character.id);
      const milestones = await db.milestones.getByCharacterId(character.id);
      const diaryEntries = await db.diary.getByCharacterId(character.id, 1);

      res.json({
        id: character.id,
        name: character.name,
        vocation: character.vocation,
        position: character.position,
        bio: character.bio,
        locationId: character.locationId,
        activityId: character.activityId,
        travelDestination: character.travelDestination,
        traits: character.traits,
        mood: {
          state: dominantMood.state,
          values: character.mood,
        },
        faith: character.faith,
        objective: character.objective,
        commitments: character.commitments,
        emergentSpecialization: character.emergentSpecialization,
        richTickCount: character.richTickCount,
        lastTickAt: character.lastTickAt,
        nextTickAt: character.nextTickAt,
        lastPlayerLoginAt: character.lastPlayerLoginAt,
        isNpc: character.isNpc,
        relationsCount: relations.length,
        milestonesCount: milestones.length,
        lastDiaryEntry: diaryEntries[0] || null,
      });
    } catch (error) {
      console.error('[API] Error getting character:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/character/:id/diary', async (req: Request, res: Response) => {
    try {
      const characterId = getParamId(req);
      const character = await db.character.getById(characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const limitParam = req.query.limit;
      const limitStr = typeof limitParam === 'string' ? limitParam : '20';
      const limit = Math.min(parseInt(limitStr) || 20, DIARY_LIMIT);
      const entries = await db.diary.getByCharacterId(characterId, limit);

      res.json({
        characterId,
        entries,
        total: entries.length,
        limit,
      });
    } catch (error) {
      console.error('[API] Error getting diary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/character/:id/milestones', async (req: Request, res: Response) => {
    try {
      const characterId = getParamId(req);
      const character = await db.character.getById(characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const milestones = await db.milestones.getByCharacterId(characterId);

      res.json({
        characterId,
        milestones,
        total: milestones.length,
      });
    } catch (error) {
      console.error('[API] Error getting milestones:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/character/:id/relations', async (req: Request, res: Response) => {
    try {
      const characterId = getParamId(req);
      const character = await db.character.getById(characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const relations = await db.relations.getByCharacterId(characterId);

      res.json({
        characterId,
        relations,
        total: relations.length,
      });
    } catch (error) {
      console.error('[API] Error getting relations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/npc/:id', async (req: Request, res: Response) => {
    try {
      const npcId = getParamId(req);
      const npc = await db.npcs.getById(npcId);
      if (!npc) {
        return res.status(404).json({ error: 'NPC not found' });
      }

      res.json(npc);
    } catch (error) {
      console.error('[API] Error getting NPC:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/world/region/:id', async (req: Request, res: Response) => {
    try {
      const regionId = getParamId(req);
      const region = REGIONS.find((r) => r.id === regionId);
      if (!region) {
        return res.status(404).json({ error: 'Region not found' });
      }

      const locations = LOCATIONS.filter((l) => l.regionId === region.id);

      res.json({
        ...region,
        locations,
      });
    } catch (error) {
      console.error('[API] Error getting region:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/world/events', async (_req: Request, res: Response) => {
    try {
      const activeEvents = WORLD_EVENTS.filter((e) => e.isActive);
      res.json({
        events: activeEvents,
        total: activeEvents.length,
      });
    } catch (error) {
      console.error('[API] Error getting events:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/world/map', async (_req: Request, res: Response) => {
    try {
      res.json({
        regions: REGIONS,
        locations: LOCATIONS,
      });
    } catch (error) {
      console.error('[API] Error getting map:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/character/:id/suggestion', async (req: Request, res: Response) => {
    try {
      const characterId = getParamId(req);
      const character = await db.character.getById(characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const parsed = SuggestionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid suggestion', details: parsed.error.errors });
      }

      const action = await db.suggestions.create({
        characterId,
        playerId: character.playerId,
        action: { ...parsed.data, message: parsed.data.message ?? null },
      });

      res.status(201).json({
        message: 'Suggestion recorded',
        action,
      });
    } catch (error) {
      console.error('[API] Error creating suggestion:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/character/:id/pray', async (req: Request, res: Response) => {
    try {
      const characterId = getParamId(req);
      const character = await db.character.getById(characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const newFaith = Math.min(10, character.faith + 1);
      const updated = await db.character.update(characterId, { faith: newFaith });

      res.json({
        message: 'Prayer sent',
        characterId,
        faith: updated.faith,
        previousFaith: character.faith,
      });
    } catch (error) {
      console.error('[API] Error praying:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/character/:id/name-npc', async (req: Request, res: Response) => {
    try {
      const characterId = getParamId(req);
      const character = await db.character.getById(characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const parsed = NameNpcSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid name', details: parsed.error.errors });
      }

      const npc = await db.npcs.getById(parsed.data.npcId);
      if (!npc) {
        return res.status(404).json({ error: 'NPC not found' });
      }

      const updated = await db.npcs.update(parsed.data.npcId, {
        name: parsed.data.name,
        namedByPlayerId: character.playerId,
        namedByPlayerName: character.name,
        namedAt: new Date(),
        isNamedByPlayer: true,
      });

      res.json({
        message: 'NPC named',
        npc: updated,
      });
    } catch (error) {
      console.error('[API] Error naming NPC:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/player/login', async (req: Request, res: Response) => {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid login data', details: parsed.error.errors });
      }

      const characters = await db.character.getByPlayerId(parsed.data.playerId);
      const now = new Date();

      for (const char of characters) {
        await db.character.update(char.id, { lastPlayerLoginAt: now });
      }

      res.json({
        message: 'Login recorded',
        playerId: parsed.data.playerId,
        charactersCount: characters.length,
        characters: characters.map((c) => ({
          id: c.id,
          name: c.name,
          vocation: c.vocation,
          lastTickAt: c.lastTickAt,
        })),
      });
    } catch (error) {
      console.error('[API] Error processing login:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/character/:id/mark-entry', async (req: Request, res: Response) => {
    try {
      const characterId = getParamId(req);
      const character = await db.character.getById(characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const parsed = MarkEntrySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid entry ID', details: parsed.error.errors });
      }

      await db.diary.create({
        characterId,
        id: parsed.data.entryId,
        isAnchored: true,
      });

      res.json({
        message: 'Entry marked as anchored',
        entryId: parsed.data.entryId,
      });
    } catch (error) {
      console.error('[API] Error marking entry:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.put('/milestone/:id/rename', async (req: Request, res: Response) => {
    try {
      const parsed = RenameMilestoneSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid title', details: parsed.error.errors });
      }

      const milestone = await db.milestones.create({
        title: parsed.data.title,
      });

      res.json({
        message: 'Milestone renamed',
        milestone,
      });
    } catch (error) {
      console.error('[API] Error renaming milestone:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/character/create', async (req: Request, res: Response) => {
    try {
      const parsed = CharacterCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid character data', details: parsed.error.errors });
      }

      const { name, description, playerId, vocation, answers } = parsed.data;

      const traits = calculateTraits(answers);

      const bioContext = `Name: ${name}. Description: ${description}. Traits: ${JSON.stringify(traits)}. Vocation: ${vocation}`;
      let bio = '';
      try {
        const bioResult = await llm.generateBio(bioContext);
        bio = bioResult.bio;
      } catch (llmError) {
        console.warn('[API] LLM bio generation failed, using fallback:', llmError);
        bio = `${name} is a ${vocation} from the lands. ${description}`;
      }

      const objectiveTypeMap: Record<string, string> = {
        lavrador: 'economic',
        andarilho: 'exploratory',
        aprendiz_artesao: 'artisanal',
        aspirante_guarda: 'military',
        comerciante_ambulante: 'economic',
      };

      const character = await db.character.create({
        name,
        playerId,
        vocation,
        bio,
        traits,
        objective: {
          id: `obj-${Date.now()}`,
          description: `Establish yourself as a ${vocation}`,
          type: objectiveTypeMap[vocation] || 'economic',
          difficulty: 1,
          progressScore: 0,
        },
      });

      res.status(201).json({
        message: 'Character created',
        character: {
          id: character.id,
          name: character.name,
          vocation: character.vocation,
          bio: character.bio,
          traits: character.traits,
          objective: character.objective,
        },
      });
    } catch (error) {
      console.error('[API] Error creating character:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/questionnaire', (_req: Request, res: Response) => {
    res.json({
      questions: CHARACTER_QUESTIONS,
      total: CHARACTER_QUESTIONS.length,
    });
  });

  router.post('/npc/generate', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        locationId: z.string(),
        vocation: z.string().optional(),
        traitBias: z.string().optional(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid data', details: parsed.error.errors });
      }

      const npc = await createNPCForLocation(parsed.data.locationId, db, llm, {
        vocation: parsed.data.vocation,
        traitBias: parsed.data.traitBias,
      });

      res.status(201).json({
        message: 'NPC generated',
        npc,
      });
    } catch (error) {
      console.error('[API] Error generating NPC:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/npcs', async (_req: Request, res: Response) => {
    try {
      const npcs = await db.npcs.getAll();
      res.json({
        npcs,
        total: npcs.length,
      });
    } catch (error) {
      console.error('[API] Error getting NPCs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/system/process-decay', async (_req: Request, res: Response) => {
    try {
      await processNPCDecay(db);
      await processRelationDecay(db);
      res.json({ message: 'Decay processed' });
    } catch (error) {
      console.error('[API] Error processing decay:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/system/group-entries', async (req: Request, res: Response) => {
    try {
      const schema = z.object({ characterId: z.string() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      await groupTrivialEntries(parsed.data.characterId, db);
      res.json({ message: 'Entries grouped' });
    } catch (error) {
      console.error('[API] Error grouping entries:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/system/reevaluate-specialization', async (req: Request, res: Response) => {
    try {
      const schema = z.object({ characterId: z.string() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid data' });
      }

      const character = await db.character.getById(parsed.data.characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const specialization = await reevaluateSpecialization(character, db, llm);
      res.json({
        message: specialization ? 'Specialization assigned' : 'Not enough data',
        specialization,
      });
    } catch (error) {
      console.error('[API] Error reevaluating specialization:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
