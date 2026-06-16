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
import { getLocationById } from '../data/world';
import { processMilestones, groupTrivialEntries, reevaluateSpecialization } from '../core/npc/milestone-system';
import { wsServer } from './websocket';
import { generateInitialMarketPrices, addToInventory, removeFromInventory, canAddToInventory } from '../core/economy/market';
import { RESOURCES, getResourceById } from '../data/resources';

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
    vocation: z.enum(['lavrador', 'andarilho', 'aprendiz_artesao', 'aspirante_guarda', 'comerciante_ambulante', 'clerigo', 'trovador', 'guerreiro', 'escriba', 'vorant']),
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

      const sourceParam = typeof req.query.source === 'string' ? req.query.source : undefined;
      const searchParam = typeof req.query.search === 'string' ? req.query.search : undefined;

      const entries = await db.diary.getByCharacterId(characterId, limit, {
        source: sourceParam,
        search: searchParam,
      });

      res.json({
        characterId,
        entries,
        total: entries.length,
        limit,
        filters: {
          source: sourceParam || null,
          search: searchParam || null,
        },
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

      wsServer.broadcastToCharacter(characterId, {
        type: 'suggestion_sent',
        data: { actionId: action.id, type: action.action.type, createdAt: action.createdAt },
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

  router.get('/character/:id/suggestions', async (req: Request, res: Response) => {
    try {
      const characterId = getParamId(req);
      const character = await db.character.getById(characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const limitParam = req.query.limit;
      const limit = Math.min(parseInt(limitParam as string) || 50, 100);
      const suggestions = await db.suggestions.getByCharacterId(characterId, limit);

      res.json({
        characterId,
        suggestions,
        total: suggestions.length,
      });
    } catch (error) {
      console.error('[API] Error getting suggestions:', error);
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

      const PRAY_COOLDOWN_MS = parseInt(process.env.PRAY_COOLDOWN_MS || '3600000', 10);
      if (character.lastPrayAt) {
        const timeSinceLastPray = Date.now() - new Date(character.lastPrayAt).getTime();
        if (timeSinceLastPray < PRAY_COOLDOWN_MS) {
          const remainingMs = PRAY_COOLDOWN_MS - timeSinceLastPray;
          const remainingMin = Math.ceil(remainingMs / 60000);
          return res.status(429).json({
            error: 'Prayer on cooldown',
            remainingMinutes: remainingMin,
          });
        }
      }

      const location = getLocationById(character.locationId);
      const faithGain = character.faith >= 8 ? 2 : 1;
      const newFaith = Math.min(10, character.faith + faithGain);

      const negativeMoods: (keyof typeof character.mood)[] = ['sadness', 'anger', 'fear', 'disgust'];
      const moodReduction = character.faith >= 8 ? 2 : 1;
      const newMood = { ...character.mood };
      for (const key of negativeMoods) {
        if (character.mood[key] > 0) {
          newMood[key] = Math.max(0, character.mood[key] - moodReduction);
        }
      }

      if (character.faith >= 9) {
        newMood.joy = Math.min(10, newMood.joy + 1);
      }

      const updated = await db.character.update(characterId, {
        faith: newFaith,
        mood: newMood,
        lastPrayAt: new Date(),
      });

      const prayDiaryEntry = await db.diary.create({
        characterId,
        text: character.faith >= 8
          ? `Rezei com fervor. A presença divina foi intensa, como um abraço quente. Minha fé se fortaleceu profundamente.`
          : `Rezei. Senti uma presença familiar me ouvindo. Minha fé se fortaleceu.`,
        source: 'template',
        occurredAt: new Date(),
        createdAt: new Date(),
        locationId: character.locationId,
        locationName: location?.name || 'Desconhecido',
        taskId: 'pray',
        moodState: character.faith >= 8 ? 'animado' : 'neutro',
        isGrouped: false,
        groupCount: null,
        isAnchored: false,
        milestoneId: null,
      });

      wsServer.broadcastToCharacter(characterId, {
        type: 'diary_entry',
        data: {
          id: prayDiaryEntry.id,
          text: prayDiaryEntry.text,
          source: prayDiaryEntry.source,
          occurredAt: prayDiaryEntry.occurredAt,
          locationName: prayDiaryEntry.locationName,
          isGrouped: prayDiaryEntry.isGrouped,
          isAnchored: prayDiaryEntry.isAnchored,
        },
      });

      res.json({
        message: 'Prayer sent',
        characterId,
        faith: updated.faith,
        previousFaith: character.faith,
        faithGain,
        moodReduced: negativeMoods.filter((k) => newMood[k] < character.mood[k]),
        diaryEntry: prayDiaryEntry,
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
      const revertedNpcs: { id: string; name: string }[] = [];

      for (const char of characters) {
        const updates: any = { lastPlayerLoginAt: now };
        if (char.isNpc) {
          updates.isNpc = false;
          revertedNpcs.push({ id: char.id, name: char.name });
        }
        await db.character.update(char.id, updates);
      }

      res.json({
        message: 'Login recorded',
        playerId: parsed.data.playerId,
        charactersCount: characters.length,
        revertedNpcs,
        characters: characters.map((c) => ({
          id: c.id,
          name: c.name,
          vocation: c.vocation,
          lastTickAt: c.lastTickAt,
          wasNpc: revertedNpcs.some((r) => r.id === c.id),
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

      const existingChars = await db.character.getByPlayerId(playerId);
      const nameTaken = existingChars.some((c) => c.name.toLowerCase() === name.toLowerCase());
      if (nameTaken) {
        return res.status(409).json({ error: 'Character name already exists' });
      }

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
        clerigo: 'spiritual',
        trovador: 'social',
        guerreiro: 'military',
        escriba: 'artisanal',
        vorant: 'spiritual',
      };
      const objectiveType = objectiveTypeMap[vocation] || 'economic';

      let objectiveDescription = `Establish yourself as a ${vocation}`;
      try {
        const objContext = `Character: ${name}, Vocation: ${vocation}, Type: ${objectiveType}. Generate a personal objective.`;
        const objResult = await llm.generateSpecialization(objContext);
        objectiveDescription = objResult.specialization;
      } catch {
        // fallback mantido
      }

      const character = await db.character.create({
        name,
        playerId,
        vocation,
        bio,
        traits,
        objective: {
          id: `obj-${Date.now()}`,
          description: objectiveDescription,
          type: objectiveType,
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

  router.get('/admin/quota', async (_req: Request, res: Response) => {
    try {
      const provider = process.env.LLM_PROVIDER || 'mock';
      const geminiKey = process.env.LLM_API_KEY || '';
      const cerebrasKey = process.env.CEREBRAS_API_KEY || '';

      const llmType = llm.constructor.name;
      const isCascade = llmType === 'CascadeLLMProvider';
      const isCerebras = llmType === 'CerebrasProvider';
      const isMock = llmType === 'MockLLMProvider';

      let activeProvider = 'mock';
      if (isCascade) {
        activeProvider = (llm as any).activeProvider || 'gemini';
      } else if (isCerebras) {
        activeProvider = 'cerebras';
      }

      let geminiStatus = { configured: !!geminiKey, quotaExceeded: false, error: null as string | null };
      let cerebrasStatus = { configured: !!cerebrasKey, quotaExceeded: false, error: null as string | null };

      if (geminiKey) {
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(geminiKey);
          const model = process.env.LLM_MODEL || 'gemini-2.0-flash';
          await genAI.getGenerativeModel({ model }).generateContent('test');
        } catch (error: any) {
          const msg = String(error);
          if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
            geminiStatus.quotaExceeded = true;
            geminiStatus.error = msg.substring(0, 300);
          } else {
            geminiStatus.error = msg.substring(0, 300);
          }
        }
      }

      if (cerebrasKey) {
        try {
          const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cerebrasKey}`,
            },
            body: JSON.stringify({
              model: process.env.CEREBRAS_MODEL || 'llama3.1-8b',
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 10,
            }),
          });
          if (!response.ok) {
            const errorText = await response.text();
            cerebrasStatus.quotaExceeded = response.status === 429;
            cerebrasStatus.error = errorText.substring(0, 300);
          }
        } catch (error: any) {
          cerebrasStatus.error = String(error).substring(0, 300);
        }
      }

      let queueStats = null;
      try {
        const bullmq = queue as any;
        if (bullmq.getQueueStats) {
          queueStats = await bullmq.getQueueStats();
        }
      } catch {
        // Queue stats not available
      }

      res.json({
        provider,
        llmType,
        activeProvider,
        isCascade,
        isCerebras,
        isMock,
        gemini: geminiStatus,
        cerebras: cerebrasStatus,
        queue: queueStats,
      });
    } catch (error) {
      console.error('[API] Error checking quota:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/admin/metrics', async (_req: Request, res: Response) => {
    try {
      const scheduler = (global as any).__scheduler;
      if (!scheduler) {
        return res.status(503).json({ error: 'Scheduler not available' });
      }
      const metrics = scheduler.getMetrics();
      res.json({ metrics });
    } catch (error) {
      console.error('[API] Error getting metrics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/admin/milestones/:characterId', async (req: Request, res: Response) => {
    try {
      const characterId = Array.isArray(req.params.characterId) ? req.params.characterId[0] : req.params.characterId;
      const milestones = await db.milestones.getByCharacterId(characterId);
      res.json({ milestones, total: milestones.length });
    } catch (error) {
      console.error('[API] Error listing milestones:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/admin/force-milestone', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        characterId: z.string(),
        triggerType: z.string(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid data', details: parsed.error.errors });
      }
      const character = await db.character.getById(parsed.data.characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }
      const milestone = await db.milestones.create({
        characterId: parsed.data.characterId,
        importance: 'relevant',
        title: 'Forced milestone',
        description: `Manually triggered: ${parsed.data.triggerType}`,
        occurredAt: new Date(),
        locationId: character.locationId,
        locationName: 'Desconhecido',
        triggerType: parsed.data.triggerType as any,
        relatedCharacterIds: [],
        relatedEventId: null,
        diaryEntryId: null,
        isActiveContext: true,
      });
      res.json({ message: 'Milestone created', milestone });
    } catch (error) {
      console.error('[API] Error forcing milestone:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/admin/export-diary/:characterId', async (req: Request, res: Response) => {
    try {
      const characterId = Array.isArray(req.params.characterId) ? req.params.characterId[0] : req.params.characterId;
      const entries = await db.diary.getByCharacterId(characterId, 1000);
      const character = await db.character.getById(characterId);
      const exportData = {
        character: character ? { name: character.name, vocation: character.vocation } : null,
        exportedAt: new Date().toISOString(),
        totalEntries: entries.length,
        entries: entries.map((e) => ({
          id: e.id,
          text: e.text,
          source: e.source,
          occurredAt: e.occurredAt,
          locationName: e.locationName,
          taskId: e.taskId,
          isAnchored: e.isAnchored,
          milestoneId: e.milestoneId,
        })),
      };
      res.json(exportData);
    } catch (error) {
      console.error('[API] Error exporting diary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/character/:id/evolve-traits', async (req: Request, res: Response) => {
    try {
      const characterId = getParamId(req);
      const character = await db.character.getById(characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const entries = await db.diary.getByCharacterId(characterId, 200);
      const taskCounts: Record<string, number> = {};
      for (const entry of entries) {
        if (entry.taskId) {
          taskCounts[entry.taskId] = (taskCounts[entry.taskId] || 0) + 1;
        }
      }

      const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
      if (totalTasks < 50) {
        return res.json({ message: 'Not enough activity for trait evolution', totalTasks });
      }

      const traitChanges: Record<string, number> = {};
      const socialRatio = (taskCounts['visit_known'] || 0 + taskCounts['tavern'] || 0) / totalTasks;
      if (socialRatio > 0.3) traitChanges['extraversion'] = 1;

      const workRatio = (taskCounts['cultivate'] || 0 + taskCounts['forge_item'] || 0 + taskCounts['patrol'] || 0) / totalTasks;
      if (workRatio > 0.4) traitChanges['conscientiousness'] = 1;

      const explorationRatio = (taskCounts['explore_route'] || 0 + taskCounts['observe_surroundings'] || 0) / totalTasks;
      if (explorationRatio > 0.2) traitChanges['openness'] = 1;

      if (Object.keys(traitChanges).length === 0) {
        return res.json({ message: 'No trait evolution triggered', taskCounts, totalTasks });
      }

      const history = character.traitHistory || [];
      for (const [trait, delta] of Object.entries(traitChanges)) {
        const key = trait as keyof typeof character.traits;
        const oldValue = character.traits[key];
        const newValue = Math.min(10, Math.max(0, oldValue + delta));
        character.traits[key] = newValue;
        history.push({ trait, oldValue, newValue, changedAt: new Date() });
      }

      await db.character.update(characterId, {
        traits: character.traits,
        traitHistory: history as any,
      });

      res.json({
        message: 'Traits evolved',
        changes: traitChanges,
        newTraits: character.traits,
        history: history.slice(-5),
      });
    } catch (error) {
      console.error('[API] Error evolving traits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/character/:id/change-vocation', async (req: Request, res: Response) => {
    try {
      const characterId = getParamId(req);
      const character = await db.character.getById(characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const entries = await db.diary.getByCharacterId(characterId, 200);
      const taskCounts: Record<string, number> = {};
      for (const entry of entries) {
        if (entry.taskId) {
          taskCounts[entry.taskId] = (taskCounts[entry.taskId] || 0) + 1;
        }
      }

      const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
      if (totalTasks < 50) {
        return res.json({ message: 'Not enough activity for vocation change', totalTasks });
      }

      const vocationTaskMap: Record<string, { tasks: string[]; minRatio: number }> = {
        clerigo: { tasks: ['bless_faithful', 'hear_confession', 'tend_sick', 'preach_sermon'], minRatio: 0.2 },
        trovador: { tasks: ['perform_tavern', 'compose_ballad', 'spread_news', 'gather_rumors'], minRatio: 0.2 },
        guerreiro: { tasks: ['spar_training', 'hunt_game', 'maintain_weapon', 'join_skirmish'], minRatio: 0.2 },
        escriba: { tasks: ['copy_document', 'write_letter', 'catalog_archive', 'translate_text'], minRatio: 0.2 },
        vorant: { tasks: ['meditate_vora', 'channel_element', 'heal_wound', 'study_lore'], minRatio: 0.2 },
        lavrador: { tasks: ['cultivate', 'harvest_production', 'care_animals'], minRatio: 0.2 },
        andarilho: { tasks: ['deliver_message', 'explore_route', 'guide_traveler'], minRatio: 0.2 },
        aprendiz_artesao: { tasks: ['forge_item', 'repair_item', 'practice_technique'], minRatio: 0.2 },
        aspirante_guarda: { tasks: ['patrol', 'train_combat', 'arrest_suspect'], minRatio: 0.2 },
        comerciante_ambulante: { tasks: ['buy_goods', 'sell_goods', 'speculate_prices'], minRatio: 0.2 },
      };

      let bestVocation: string | null = null;
      let bestRatio = 0;

      for (const [vocation, config] of Object.entries(vocationTaskMap)) {
        if (vocation === character.vocation) continue;
        const matchingTasks = config.tasks.reduce((sum, t) => sum + (taskCounts[t] || 0), 0);
        const ratio = matchingTasks / totalTasks;
        if (ratio >= config.minRatio && ratio > bestRatio) {
          bestRatio = ratio;
          bestVocation = vocation;
        }
      }

      if (!bestVocation) {
        return res.json({ message: 'No vocation change detected', currentVocation: character.vocation });
      }

      const previousVocation = character.vocation;
      await db.character.update(characterId, {
        vocation: bestVocation,
        previousVocation,
      });

      wsServer.broadcastToCharacter(characterId, {
        type: 'vocation_change',
        data: {
          previousVocation,
          newVocation: bestVocation,
          triggerRatio: bestRatio,
        },
      });

      res.json({
        message: 'Vocation changed',
        previousVocation,
        newVocation: bestVocation,
        triggerRatio: bestRatio,
      });
    } catch (error) {
      console.error('[API] Error changing vocation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/character/:id/resurrect', async (req: Request, res: Response) => {
    try {
      const characterId = getParamId(req);
      const character = await db.character.getById(characterId);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      if (!character.isNpc) {
        return res.status(400).json({ error: 'Character is not in NPC mode' });
      }

      await db.character.update(characterId, {
        isNpc: false,
        lastPlayerLoginAt: new Date(),
        nextTickAt: new Date(Date.now() + 30 * 60 * 1000),
      });

      wsServer.broadcastToCharacter(characterId, {
        type: 'character_resurrected',
        data: {
          characterId: character.id,
          characterName: character.name,
          resurrectedAt: new Date().toISOString(),
        },
      });

      res.json({
        message: 'Character resurrected',
        character: {
          id: character.id,
          name: character.name,
          isNpc: false,
        },
      });
    } catch (error) {
      console.error('[API] Error resurrecting character:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Quest Routes
  router.get('/character/:id/quests', async (req: Request, res: Response) => {
    try {
      const quests = await db.quests.getByCharacterId(String(req.params.id));
      res.json({ quests });
    } catch (error) {
      console.error('[API] Error fetching quests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/character/:id/quests/start', async (req: Request, res: Response) => {
    try {
      const characterId = String(req.params.id);
      const { templateId } = req.body as { templateId: string };
      if (!templateId) {
        res.status(400).json({ error: 'templateId required' });
        return;
      }
      const character = await db.character.getById(characterId);
      if (!character) {
        res.status(404).json({ error: 'Character not found' });
        return;
      }
      const { getQuestTemplate } = await import('../data/quests');
      const template = getQuestTemplate(templateId);
      if (!template) {
        res.status(404).json({ error: 'Quest template not found' });
        return;
      }
      const { startQuest, getAvailableQuests } = await import('../core/quests/quest-engine');
      const available = getAvailableQuests(character);
      if (!available.find((q) => q.id === templateId)) {
        res.status(400).json({ error: 'Quest not available for this character' });
        return;
      }
      const quest = await startQuest(character, templateId, db);
      if (!quest) {
        res.status(400).json({ error: 'Could not start quest' });
        return;
      }
      res.json({ quest });
    } catch (error) {
      console.error('[API] Error starting quest:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/character/:id/quests/available', async (req: Request, res: Response) => {
    try {
      const characterId = String(req.params.id);
      const character = await db.character.getById(characterId);
      if (!character) {
        res.status(404).json({ error: 'Character not found' });
        return;
      }
      const { getAvailableQuests } = await import('../core/quests/quest-engine');
      const available = getAvailableQuests(character);
      res.json({ quests: available.map((q) => ({ id: q.id, title: q.title, description: q.description, tier: q.tier, requirements: q.requirements, rewards: q.rewards })) });
    } catch (error) {
      console.error('[API] Error fetching available quests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Skill Routes
  router.get('/character/:id/skills', async (req: Request, res: Response) => {
    try {
      const characterId = String(req.params.id);
      const character = await db.character.getById(characterId);
      if (!character) { res.status(404).json({ error: 'Character not found' }); return; }
      const { getSkillsByVocation } = await import('../data/skills');
      const skills = getSkillsByVocation(character.vocation);
      res.json({ skills: skills.map((s) => ({ id: s.id, name: s.name, description: s.description, category: s.category, maxLevel: s.maxLevel })) });
    } catch (error) {
      console.error('[API] Error fetching skills:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/character/:id/encounter', async (req: Request, res: Response) => {
    try {
      const characterId = String(req.params.id);
      const character = await db.character.getById(characterId);
      if (!character) { res.status(404).json({ error: 'Character not found' }); return; }
      const { generateRandomEncounter, resolveCombatRound, createHealthState } = await import('../core/combat/combat-engine');
      const encounter = generateRandomEncounter(character);
      const health = createHealthState(character);
      const round = resolveCombatRound(
        character, encounter.hp, encounter.hp, encounter.damage,
        { type: 'attack', description: 'Ataque inicial' },
        health.hp, []
      );
      res.json({
        encounter: { name: encounter.name, type: encounter.type, hp: encounter.hp, damage: encounter.damage },
        round,
        health: { hp: health.hp, maxHp: health.maxHp },
      });
    } catch (error) {
      console.error('[API] Error generating encounter:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Economic Routes
  router.get('/character/:id/inventory', async (req: Request, res: Response) => {
    try {
      const inventory = await db.economy.getInventory(String(req.params.id));
      res.json(inventory);
    } catch (error) {
      console.error('[API] Error fetching inventory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/market/:locationId', async (req: Request, res: Response) => {
    try {
      const locId = String(req.params.locationId);
      const location = getLocationById(locId);
      if (!location) {
        res.status(404).json({ error: 'Location not found' });
        return;
      }
      let prices = await db.economy.getMarketPrices(locId);
      if (prices.length === 0) {
        prices = generateInitialMarketPrices(locId);
      }
      res.json({ location: { id: location.id, name: location.name, type: location.type }, prices });
    } catch (error) {
      console.error('[API] Error fetching market:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/character/:id/buy', async (req: Request, res: Response) => {
    try {
      const cid = String(req.params.id);
      const { resourceId, quantity } = req.body as { resourceId: string; quantity: number };

      if (!resourceId || !quantity || quantity <= 0) {
        res.status(400).json({ error: 'resourceId and positive quantity required' });
        return;
      }

      const resource = getResourceById(resourceId);
      if (!resource) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      const character = await db.character.getById(cid);
      if (!character) {
        res.status(404).json({ error: 'Character not found' });
        return;
      }

      const inventory = await db.economy.getInventory(cid);
      const prices = await db.economy.getMarketPrices(character.locationId);
      const priceData = prices.find((p: any) => p.resourceId === resourceId);
      if (!priceData) {
        res.status(400).json({ error: 'Resource not available at this location' });
        return;
      }

      const totalCost = priceData.currentPrice * quantity;
      if (inventory.gold < totalCost) {
        res.status(400).json({ error: 'Insufficient gold' });
        return;
      }

      if (!canAddToInventory(inventory, resourceId, quantity)) {
        res.status(400).json({ error: 'Insufficient storage capacity' });
        return;
      }

      await db.economy.updateGold(cid, inventory.gold - totalCost);
      await db.economy.updateInventory(cid, resourceId, quantity);

      const updatedInventory = await db.economy.getInventory(cid);
      res.json({ success: true, totalCost, inventory: updatedInventory });
    } catch (error) {
      console.error('[API] Error buying:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/character/:id/sell', async (req: Request, res: Response) => {
    try {
      const cid = String(req.params.id);
      const { resourceId, quantity } = req.body as { resourceId: string; quantity: number };

      if (!resourceId || !quantity || quantity <= 0) {
        res.status(400).json({ error: 'resourceId and positive quantity required' });
        return;
      }

      const character = await db.character.getById(cid);
      if (!character) {
        res.status(404).json({ error: 'Character not found' });
        return;
      }

      const inventory = await db.economy.getInventory(cid);
      const item = inventory.items.find((i: any) => i.resourceId === resourceId);
      if (!item || item.quantity < quantity) {
        res.status(400).json({ error: 'Insufficient items in inventory' });
        return;
      }

      const prices = await db.economy.getMarketPrices(character.locationId);
      const priceData = prices.find((p: any) => p.resourceId === resourceId);
      const sellPrice = priceData ? priceData.currentPrice * 0.8 : 1;
      const totalRevenue = sellPrice * quantity;

      await db.economy.updateGold(cid, inventory.gold + totalRevenue);
      await db.economy.updateInventory(cid, resourceId, -quantity);

      const updatedInventory = await db.economy.getInventory(cid);
      res.json({ success: true, totalRevenue, inventory: updatedInventory });
    } catch (error) {
      console.error('[API] Error selling:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/resources', async (_req: Request, res: Response) => {
    res.json({ resources: RESOURCES.map((r) => ({ id: r.id, name: r.name, category: r.category, basePrice: r.basePrice, description: r.description })) });
  });

  return router;
}
