"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = createRoutes;
const express_1 = require("express");
const data_1 = require("../data");
const questionnaire_1 = require("../data/questionnaire");
const models_1 = require("../models");
const zod_1 = require("zod");
const npc_system_1 = require("../core/npc/npc-system");
const world_1 = require("../data/world");
const milestone_system_1 = require("../core/npc/milestone-system");
const websocket_1 = require("./websocket");
const router = (0, express_1.Router)();
function createRoutes(deps) {
    const { db, queue, llm } = deps;
    const getParamId = (req) => req.params.id;
    const CharacterCreateSchema = zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        description: zod_1.z.string().min(1).max(500),
        playerId: zod_1.z.string().min(1).max(100),
        vocation: zod_1.z.enum(['lavrador', 'andarilho', 'aprendiz_artesao', 'aspirante_guarda', 'comerciante_ambulante']),
        answers: zod_1.z.array(zod_1.z.object({
            questionId: zod_1.z.number(),
            optionLetter: zod_1.z.string().length(1),
        })).min(10).max(10),
    });
    const SuggestionSchema = zod_1.z.object({
        type: zod_1.z.enum(['task', 'destination', 'vision']),
        taskId: zod_1.z.string().optional(),
        locationId: zod_1.z.string().optional(),
        text: zod_1.z.string().max(200).optional(),
        message: zod_1.z.string().max(500).optional().nullable(),
    });
    const PraySchema = zod_1.z.object({
        characterId: zod_1.z.string(),
    });
    const NameNpcSchema = zod_1.z.object({
        npcId: zod_1.z.string(),
        name: zod_1.z.string().min(1).max(100),
    });
    const LoginSchema = zod_1.z.object({
        playerId: zod_1.z.string().min(1).max(100),
    });
    const MarkEntrySchema = zod_1.z.object({
        entryId: zod_1.z.string(),
    });
    const RenameMilestoneSchema = zod_1.z.object({
        title: zod_1.z.string().min(1).max(200),
    });
    router.get('/health', (_req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
        });
    });
    router.get('/character/:id', async (req, res) => {
        try {
            const characterId = getParamId(req);
            const character = await db.character.getById(characterId);
            if (!character) {
                return res.status(404).json({ error: 'Character not found' });
            }
            const dominantMood = (0, models_1.getDominantMood)(character.mood);
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
        }
        catch (error) {
            console.error('[API] Error getting character:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/character/:id/diary', async (req, res) => {
        try {
            const characterId = getParamId(req);
            const character = await db.character.getById(characterId);
            if (!character) {
                return res.status(404).json({ error: 'Character not found' });
            }
            const limitParam = req.query.limit;
            const limitStr = typeof limitParam === 'string' ? limitParam : '20';
            const limit = Math.min(parseInt(limitStr) || 20, models_1.DIARY_LIMIT);
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
        }
        catch (error) {
            console.error('[API] Error getting diary:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/character/:id/milestones', async (req, res) => {
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
        }
        catch (error) {
            console.error('[API] Error getting milestones:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/character/:id/relations', async (req, res) => {
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
        }
        catch (error) {
            console.error('[API] Error getting relations:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/npc/:id', async (req, res) => {
        try {
            const npcId = getParamId(req);
            const npc = await db.npcs.getById(npcId);
            if (!npc) {
                return res.status(404).json({ error: 'NPC not found' });
            }
            res.json(npc);
        }
        catch (error) {
            console.error('[API] Error getting NPC:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/world/region/:id', async (req, res) => {
        try {
            const regionId = getParamId(req);
            const region = data_1.REGIONS.find((r) => r.id === regionId);
            if (!region) {
                return res.status(404).json({ error: 'Region not found' });
            }
            const locations = data_1.LOCATIONS.filter((l) => l.regionId === region.id);
            res.json({
                ...region,
                locations,
            });
        }
        catch (error) {
            console.error('[API] Error getting region:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/world/events', async (_req, res) => {
        try {
            const activeEvents = data_1.WORLD_EVENTS.filter((e) => e.isActive);
            res.json({
                events: activeEvents,
                total: activeEvents.length,
            });
        }
        catch (error) {
            console.error('[API] Error getting events:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/world/map', async (_req, res) => {
        try {
            res.json({
                regions: data_1.REGIONS,
                locations: data_1.LOCATIONS,
            });
        }
        catch (error) {
            console.error('[API] Error getting map:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/character/:id/suggestion', async (req, res) => {
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
            websocket_1.wsServer.broadcastToCharacter(characterId, {
                type: 'suggestion_sent',
                data: { actionId: action.id, type: action.action.type, createdAt: action.createdAt },
            });
            res.status(201).json({
                message: 'Suggestion recorded',
                action,
            });
        }
        catch (error) {
            console.error('[API] Error creating suggestion:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/character/:id/suggestions', async (req, res) => {
        try {
            const characterId = getParamId(req);
            const character = await db.character.getById(characterId);
            if (!character) {
                return res.status(404).json({ error: 'Character not found' });
            }
            const limitParam = req.query.limit;
            const limit = Math.min(parseInt(limitParam) || 50, 100);
            const suggestions = await db.suggestions.getByCharacterId(characterId, limit);
            res.json({
                characterId,
                suggestions,
                total: suggestions.length,
            });
        }
        catch (error) {
            console.error('[API] Error getting suggestions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/character/:id/pray', async (req, res) => {
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
            const location = (0, world_1.getLocationById)(character.locationId);
            const newFaith = Math.min(10, character.faith + 1);
            const negativeMoods = ['sadness', 'anger', 'fear', 'disgust'];
            const highestNegative = negativeMoods.reduce((max, key) => character.mood[key] > character.mood[max] ? key : max, 'sadness');
            const newMood = { ...character.mood };
            if (character.mood[highestNegative] > 0) {
                newMood[highestNegative] = Math.max(0, character.mood[highestNegative] - 1);
            }
            const updated = await db.character.update(characterId, {
                faith: newFaith,
                mood: newMood,
                lastPrayAt: new Date(),
            });
            const prayDiaryEntry = await db.diary.create({
                characterId,
                text: `Rezei. Senti uma presença familiar me ouvindo. Minha fé se fortaleceu.`,
                source: 'template',
                occurredAt: new Date(),
                createdAt: new Date(),
                locationId: character.locationId,
                locationName: location?.name || 'Desconhecido',
                taskId: 'pray',
                moodState: 'animado',
                isGrouped: false,
                groupCount: null,
                isAnchored: false,
                milestoneId: null,
            });
            websocket_1.wsServer.broadcastToCharacter(characterId, {
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
                moodReduced: highestNegative,
                diaryEntry: prayDiaryEntry,
            });
        }
        catch (error) {
            console.error('[API] Error praying:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/character/:id/name-npc', async (req, res) => {
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
        }
        catch (error) {
            console.error('[API] Error naming NPC:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/player/login', async (req, res) => {
        try {
            const parsed = LoginSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: 'Invalid login data', details: parsed.error.errors });
            }
            const characters = await db.character.getByPlayerId(parsed.data.playerId);
            const now = new Date();
            const revertedNpcs = [];
            for (const char of characters) {
                const updates = { lastPlayerLoginAt: now };
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
        }
        catch (error) {
            console.error('[API] Error processing login:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/character/:id/mark-entry', async (req, res) => {
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
        }
        catch (error) {
            console.error('[API] Error marking entry:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.put('/milestone/:id/rename', async (req, res) => {
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
        }
        catch (error) {
            console.error('[API] Error renaming milestone:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/character/create', async (req, res) => {
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
            const traits = (0, questionnaire_1.calculateTraits)(answers);
            const bioContext = `Name: ${name}. Description: ${description}. Traits: ${JSON.stringify(traits)}. Vocation: ${vocation}`;
            let bio = '';
            try {
                const bioResult = await llm.generateBio(bioContext);
                bio = bioResult.bio;
            }
            catch (llmError) {
                console.warn('[API] LLM bio generation failed, using fallback:', llmError);
                bio = `${name} is a ${vocation} from the lands. ${description}`;
            }
            const objectiveTypeMap = {
                lavrador: 'economic',
                andarilho: 'exploratory',
                aprendiz_artesao: 'artisanal',
                aspirante_guarda: 'military',
                comerciante_ambulante: 'economic',
            };
            const objectiveType = objectiveTypeMap[vocation] || 'economic';
            let objectiveDescription = `Establish yourself as a ${vocation}`;
            try {
                const objContext = `Character: ${name}, Vocation: ${vocation}, Type: ${objectiveType}. Generate a personal objective.`;
                const objResult = await llm.generateSpecialization(objContext);
                objectiveDescription = objResult.specialization;
            }
            catch {
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
        }
        catch (error) {
            console.error('[API] Error creating character:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/questionnaire', (_req, res) => {
        res.json({
            questions: questionnaire_1.CHARACTER_QUESTIONS,
            total: questionnaire_1.CHARACTER_QUESTIONS.length,
        });
    });
    router.post('/npc/generate', async (req, res) => {
        try {
            const schema = zod_1.z.object({
                locationId: zod_1.z.string(),
                vocation: zod_1.z.string().optional(),
                traitBias: zod_1.z.string().optional(),
            });
            const parsed = schema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: 'Invalid data', details: parsed.error.errors });
            }
            const npc = await (0, npc_system_1.createNPCForLocation)(parsed.data.locationId, db, llm, {
                vocation: parsed.data.vocation,
                traitBias: parsed.data.traitBias,
            });
            res.status(201).json({
                message: 'NPC generated',
                npc,
            });
        }
        catch (error) {
            console.error('[API] Error generating NPC:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/npcs', async (_req, res) => {
        try {
            const npcs = await db.npcs.getAll();
            res.json({
                npcs,
                total: npcs.length,
            });
        }
        catch (error) {
            console.error('[API] Error getting NPCs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/system/process-decay', async (_req, res) => {
        try {
            await (0, npc_system_1.processNPCDecay)(db);
            await (0, npc_system_1.processRelationDecay)(db);
            res.json({ message: 'Decay processed' });
        }
        catch (error) {
            console.error('[API] Error processing decay:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/system/group-entries', async (req, res) => {
        try {
            const schema = zod_1.z.object({ characterId: zod_1.z.string() });
            const parsed = schema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: 'Invalid data' });
            }
            await (0, milestone_system_1.groupTrivialEntries)(parsed.data.characterId, db);
            res.json({ message: 'Entries grouped' });
        }
        catch (error) {
            console.error('[API] Error grouping entries:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/system/reevaluate-specialization', async (req, res) => {
        try {
            const schema = zod_1.z.object({ characterId: zod_1.z.string() });
            const parsed = schema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: 'Invalid data' });
            }
            const character = await db.character.getById(parsed.data.characterId);
            if (!character) {
                return res.status(404).json({ error: 'Character not found' });
            }
            const specialization = await (0, milestone_system_1.reevaluateSpecialization)(character, db, llm);
            res.json({
                message: specialization ? 'Specialization assigned' : 'Not enough data',
                specialization,
            });
        }
        catch (error) {
            console.error('[API] Error reevaluating specialization:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/admin/quota', async (_req, res) => {
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
                activeProvider = llm.activeProvider || 'gemini';
            }
            else if (isCerebras) {
                activeProvider = 'cerebras';
            }
            let geminiStatus = { configured: !!geminiKey, quotaExceeded: false, error: null };
            let cerebrasStatus = { configured: !!cerebrasKey, quotaExceeded: false, error: null };
            if (geminiKey) {
                try {
                    const { GoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@google/generative-ai')));
                    const genAI = new GoogleGenerativeAI(geminiKey);
                    const model = process.env.LLM_MODEL || 'gemini-2.0-flash';
                    await genAI.getGenerativeModel({ model }).generateContent('test');
                }
                catch (error) {
                    const msg = String(error);
                    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
                        geminiStatus.quotaExceeded = true;
                        geminiStatus.error = msg.substring(0, 300);
                    }
                    else {
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
                }
                catch (error) {
                    cerebrasStatus.error = String(error).substring(0, 300);
                }
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
            });
        }
        catch (error) {
            console.error('[API] Error checking quota:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/admin/metrics', async (_req, res) => {
        try {
            const scheduler = global.__scheduler;
            if (!scheduler) {
                return res.status(503).json({ error: 'Scheduler not available' });
            }
            const metrics = scheduler.getMetrics();
            res.json({ metrics });
        }
        catch (error) {
            console.error('[API] Error getting metrics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/admin/milestones/:characterId', async (req, res) => {
        try {
            const characterId = Array.isArray(req.params.characterId) ? req.params.characterId[0] : req.params.characterId;
            const milestones = await db.milestones.getByCharacterId(characterId);
            res.json({ milestones, total: milestones.length });
        }
        catch (error) {
            console.error('[API] Error listing milestones:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.post('/admin/force-milestone', async (req, res) => {
        try {
            const schema = zod_1.z.object({
                characterId: zod_1.z.string(),
                triggerType: zod_1.z.string(),
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
                triggerType: parsed.data.triggerType,
                relatedCharacterIds: [],
                relatedEventId: null,
                diaryEntryId: null,
                isActiveContext: true,
            });
            res.json({ message: 'Milestone created', milestone });
        }
        catch (error) {
            console.error('[API] Error forcing milestone:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    router.get('/admin/export-diary/:characterId', async (req, res) => {
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
        }
        catch (error) {
            console.error('[API] Error exporting diary:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    return router;
}
//# sourceMappingURL=routes.js.map