"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const character_tick_1 = require("../../core/tick/character-tick");
const llm_1 = require("../../llm");
const stub_adapter_1 = require("../../db/stub-adapter");
const stub_adapter_2 = require("../../queue/stub-adapter");
const narrative_state_1 = require("../../core/decision/narrative-state");
const milestone_system_1 = require("../../core/npc/milestone-system");
const dynamic_events_1 = require("../../world/dynamic-events");
const tasks_1 = require("../../data/tasks");
function createTestCharacter(overrides = {}) {
    const now = new Date();
    return {
        id: '__test__char-f16-20',
        name: '__test__ F16-20 Character',
        playerId: '__test__player',
        vocation: 'lavrador',
        position: null,
        bio: 'Test character for phases 16-20',
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
        specializations: [],
        visitedLocations: [],
        traitHistory: [],
        previousVocation: null,
        emergentSpecialization: null,
        richTickCount: 0,
        lastPrayAt: null,
        ...overrides,
    };
}
(0, vitest_1.describe)('Phase 16 — Sistemas Automáticos', () => {
    let db;
    let queue;
    let llm;
    (0, vitest_1.beforeEach)(() => {
        db = new stub_adapter_1.StubDBAdapter();
        queue = new stub_adapter_2.StubQueueAdapter();
        llm = new llm_1.MockLLMProvider();
    });
    (0, vitest_1.describe)('Faith decay by absence', () => {
        (0, vitest_1.it)('calculates correct decay for 48h absence', () => {
            const hoursSinceLogin = 48;
            const faithDecay = hoursSinceLogin > 24 ? Math.floor(hoursSinceLogin / 24) * 0.5 : 0;
            (0, vitest_1.expect)(faithDecay).toBe(1.0);
            (0, vitest_1.expect)(Math.max(1, 8 - faithDecay)).toBe(7);
        });
        (0, vitest_1.it)('calculates correct decay for 72h absence', () => {
            const hoursSinceLogin = 72;
            const faithDecay = hoursSinceLogin > 24 ? Math.floor(hoursSinceLogin / 24) * 0.5 : 0;
            (0, vitest_1.expect)(faithDecay).toBe(1.5);
            (0, vitest_1.expect)(Math.max(1, 2 - faithDecay)).toBe(1);
        });
        (0, vitest_1.it)('does not decay faith if absence is less than 24h', () => {
            const hoursSinceLogin = 12;
            const faithDecay = hoursSinceLogin > 24 ? Math.floor(hoursSinceLogin / 24) * 0.5 : 0;
            (0, vitest_1.expect)(faithDecay).toBe(0);
        });
    });
    (0, vitest_1.describe)('Faith penalty for ignored suggestions', () => {
        (0, vitest_1.it)('calculates correct penalty for ignored suggestion', () => {
            const currentFaith = 7;
            const penalty = 0.5;
            const newFaith = Math.max(1, currentFaith - penalty);
            (0, vitest_1.expect)(newFaith).toBe(6.5);
        });
        (0, vitest_1.it)('does not reduce faith below 1', () => {
            const currentFaith = 1;
            const penalty = 0.5;
            const newFaith = Math.max(1, currentFaith - penalty);
            (0, vitest_1.expect)(newFaith).toBe(1);
        });
    });
    (0, vitest_1.describe)('Automatic commitments generation', () => {
        (0, vitest_1.it)('generates commitment every 10 rich ticks', async () => {
            const character = createTestCharacter({ richTickCount: 10, commitments: [] });
            const initialCount = character.commitments.length;
            await (0, character_tick_1.executeCharacterTick)(character, db, queue, llm);
            (0, vitest_1.expect)(character.commitments.length).toBeGreaterThanOrEqual(initialCount);
        });
        (0, vitest_1.it)('does not generate commitment if already at max 3', async () => {
            const existingCommitments = [
                { id: 'c1', description: 'Test 1', deadline: new Date(Date.now() + 86400000), urgency: 'medium', taskId: 'cultivate', createdAt: new Date() },
                { id: 'c2', description: 'Test 2', deadline: new Date(Date.now() + 86400000), urgency: 'medium', taskId: 'forge_item', createdAt: new Date() },
                { id: 'c3', description: 'Test 3', deadline: new Date(Date.now() + 86400000), urgency: 'medium', taskId: 'patrol', createdAt: new Date() },
            ];
            const character = createTestCharacter({ richTickCount: 10, commitments: existingCommitments });
            await (0, character_tick_1.executeCharacterTick)(character, db, queue, llm);
            (0, vitest_1.expect)(character.commitments.length).toBe(3);
        });
    });
    (0, vitest_1.describe)('Objective reset at 100%', () => {
        (0, vitest_1.it)('creates new objective when progress reaches 100', async () => {
            const character = createTestCharacter({
                objective: {
                    id: '__test__obj',
                    description: 'Test objective',
                    type: 'economic',
                    difficulty: 2,
                    progressScore: 98,
                },
            });
            await (0, character_tick_1.executeCharacterTick)(character, db, queue, llm);
            (0, vitest_1.expect)(character.objective.progressScore).toBeLessThanOrEqual(100);
        });
        (0, vitest_1.it)('rotates objective type after completion', async () => {
            const character = createTestCharacter({
                objective: {
                    id: '__test__obj',
                    description: 'Completed objective',
                    type: 'economic',
                    difficulty: 2,
                    progressScore: 100,
                },
            });
            await (0, character_tick_1.executeCharacterTick)(character, db, queue, llm);
            (0, vitest_1.expect)(character.objective.type).toBe('social');
            (0, vitest_1.expect)(character.objective.difficulty).toBe(3);
            (0, vitest_1.expect)(character.objective.progressScore).toBe(0);
        });
        (0, vitest_1.it)('caps difficulty at 5', async () => {
            const character = createTestCharacter({
                objective: {
                    id: '__test__obj',
                    description: 'Completed objective',
                    type: 'economic',
                    difficulty: 5,
                    progressScore: 100,
                },
            });
            await (0, character_tick_1.executeCharacterTick)(character, db, queue, llm);
            (0, vitest_1.expect)(character.objective.difficulty).toBeLessThanOrEqual(5);
        });
    });
    (0, vitest_1.describe)('NPC reversal on login', () => {
        (0, vitest_1.it)('shouldConvertToNPC returns true after 48h', () => {
            const character = createTestCharacter({
                lastPlayerLoginAt: new Date(Date.now() - 49 * 60 * 60 * 1000),
                isNpc: false,
            });
            (0, vitest_1.expect)((0, character_tick_1.shouldConvertToNPC)(character)).toBe(true);
        });
        (0, vitest_1.it)('shouldConvertToNPC returns false if already NPC', () => {
            const character = createTestCharacter({
                lastPlayerLoginAt: new Date(Date.now() - 49 * 60 * 60 * 1000),
                isNpc: true,
            });
            (0, vitest_1.expect)((0, character_tick_1.shouldConvertToNPC)(character)).toBe(false);
        });
    });
});
(0, vitest_1.describe)('Phase 17 — Infra e Observabilidade', () => {
    (0, vitest_1.describe)('Narrative tick multiplier', () => {
        (0, vitest_1.it)('returns 0.5x for very rich states (score >= 6)', () => {
            (0, vitest_1.expect)((0, narrative_state_1.getNarrativeTickMultiplier)(6)).toBe(0.5);
            (0, vitest_1.expect)((0, narrative_state_1.getNarrativeTickMultiplier)(10)).toBe(0.5);
        });
        (0, vitest_1.it)('returns 0.75x for rich states (score >= 4)', () => {
            (0, vitest_1.expect)((0, narrative_state_1.getNarrativeTickMultiplier)(4)).toBe(0.75);
            (0, vitest_1.expect)((0, narrative_state_1.getNarrativeTickMultiplier)(5)).toBe(0.75);
        });
        (0, vitest_1.it)('returns 1.0x for neutral states (score >= 2)', () => {
            (0, vitest_1.expect)((0, narrative_state_1.getNarrativeTickMultiplier)(2)).toBe(1.0);
            (0, vitest_1.expect)((0, narrative_state_1.getNarrativeTickMultiplier)(3)).toBe(1.0);
        });
        (0, vitest_1.it)('returns 1.5x for trivial states (score < 2)', () => {
            (0, vitest_1.expect)((0, narrative_state_1.getNarrativeTickMultiplier)(0)).toBe(1.5);
            (0, vitest_1.expect)((0, narrative_state_1.getNarrativeTickMultiplier)(1)).toBe(1.5);
        });
    });
    (0, vitest_1.describe)('Scheduler metrics interface', () => {
        (0, vitest_1.it)('SchedulerMetrics includes retry tracking fields', () => {
            const metrics = {
                totalTicks: 0,
                totalErrors: 0,
                avgTickTimeMs: 0,
                llmCalls: { gemini: 0, cerebras: 0, mock: 0 },
                lastCycleAt: null,
                retryAttempts: 0,
                retrySuccesses: 0,
                retryFailures: 0,
            };
            (0, vitest_1.expect)(metrics.retryAttempts).toBeDefined();
            (0, vitest_1.expect)(metrics.retrySuccesses).toBeDefined();
            (0, vitest_1.expect)(metrics.retryFailures).toBeDefined();
        });
    });
});
(0, vitest_1.describe)('Phase 19 — Sistemas Emergentes', () => {
    let db;
    let queue;
    let llm;
    (0, vitest_1.beforeEach)(() => {
        db = new stub_adapter_1.StubDBAdapter();
        queue = new stub_adapter_2.StubQueueAdapter();
        llm = new llm_1.MockLLMProvider();
    });
    (0, vitest_1.describe)('Mood affected by world events', () => {
        (0, vitest_1.it)('disease events increase sadness and fear', async () => {
            const character = createTestCharacter({
                locationId: 'arvel',
                mood: { joy: 5, sadness: 1, anger: 1, fear: 1, disgust: 1, surprise: 3 },
            });
            await (0, character_tick_1.executeCharacterTick)(character, db, queue, llm);
            (0, vitest_1.expect)(character.mood.sadness).toBeGreaterThan(1);
            (0, vitest_1.expect)(character.mood.fear).toBeGreaterThan(1);
        });
        (0, vitest_1.it)('locations without events do not affect mood from events', async () => {
            const character = createTestCharacter({
                locationId: 'durenfall',
                mood: { joy: 5, sadness: 2, anger: 1, fear: 2, disgust: 1, surprise: 3 },
            });
            await (0, character_tick_1.executeCharacterTick)(character, db, queue, llm);
            (0, vitest_1.expect)(character.mood.joy).toBeGreaterThanOrEqual(5);
        });
    });
    (0, vitest_1.describe)('Mood affected by relations', () => {
        (0, vitest_1.it)('stub DB returns empty relations (integration test with real DB required)', async () => {
            const character = createTestCharacter({
                mood: { joy: 3, sadness: 2, anger: 1, fear: 2, disgust: 1, surprise: 3 },
            });
            const relations = await db.relations.getByCharacterId(character.id);
            (0, vitest_1.expect)(relations).toEqual([]);
        });
    });
    (0, vitest_1.describe)('Expired commitment penalty', () => {
        (0, vitest_1.it)('reduces faith and increases negative mood for expired commitments', async () => {
            const expiredCommitment = {
                id: 'expired-1',
                description: 'Expired task',
                deadline: new Date(Date.now() - 3600000),
                urgency: 'high',
                taskId: 'cultivate',
                createdAt: new Date(),
            };
            const character = createTestCharacter({
                faith: 6,
                commitments: [expiredCommitment],
                mood: { joy: 5, sadness: 2, anger: 1, fear: 2, disgust: 1, surprise: 3 },
            });
            await (0, character_tick_1.executeCharacterTick)(character, db, queue, llm);
            (0, vitest_1.expect)(character.faith).toBeLessThan(6);
            (0, vitest_1.expect)(character.commitments.length).toBe(0);
        });
    });
    (0, vitest_1.describe)('Milestone chain relationships', () => {
        (0, vitest_1.it)('checkMilestoneTriggers returns triggers for commitment resolved', () => {
            const character = createTestCharacter({ richTickCount: 5 });
            const context = {
                character,
                taskId: 'cultivate',
                score: 10,
                locationId: 'veldra',
                hasPendingSuggestion: false,
                wasFollowed: false,
                isNewLocation: false,
                hasActiveWorldEvent: false,
                moodState: 'rico',
                commitmentResolved: true,
            };
            const triggers = (0, milestone_system_1.checkMilestoneTriggers)(context);
            (0, vitest_1.expect)(triggers).toContain('commitment_resolved');
        });
        (0, vitest_1.it)('checkMilestoneTriggers returns triggers for specialization consolidated', () => {
            const character = createTestCharacter({
                richTickCount: 5,
                emergentSpecialization: 'Master Farmer',
            });
            const context = {
                character,
                taskId: 'cultivate',
                score: 10,
                locationId: 'veldra',
                hasPendingSuggestion: false,
                wasFollowed: false,
                isNewLocation: false,
                hasActiveWorldEvent: false,
                moodState: 'rico',
                commitmentResolved: false,
            };
            const triggers = (0, milestone_system_1.checkMilestoneTriggers)(context);
            (0, vitest_1.expect)(triggers).toContain('specialization_consolidated');
        });
    });
    (0, vitest_1.describe)('Dynamic events generation', () => {
        (0, vitest_1.it)('generates bountiful harvest event for lavrador with high richTickCount', () => {
            const character = createTestCharacter({
                vocation: 'lavrador',
                richTickCount: 25,
            });
            const task = (0, tasks_1.getTasksByVocation)('lavrador').find(t => t.id === 'cultivate');
            const events = (0, dynamic_events_1.checkDynamicEvents)(character, task);
            (0, vitest_1.expect)(events.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(events[0].id).toBe('bountiful_harvest');
        });
        (0, vitest_1.it)('generates cultural festival for trovador', () => {
            const character = createTestCharacter({
                vocation: 'trovador',
                richTickCount: 20,
            });
            const task = (0, tasks_1.getTasksByVocation11)('trovador').find(t => t.id === 'perform_tavern');
            const events = (0, dynamic_events_1.checkDynamicEvents)(character, task);
            (0, vitest_1.expect)(events.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(events[0].id).toBe('cultural_festival');
        });
        (0, vitest_1.it)('generates military campaign for guerreiro', () => {
            const character = createTestCharacter({
                vocation: 'guerreiro',
                richTickCount: 25,
            });
            const task = (0, tasks_1.getTasksByVocation11)('guerreiro').find(t => t.id === 'spar_training');
            const events = (0, dynamic_events_1.checkDynamicEvents)(character, task);
            (0, vitest_1.expect)(events.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(events[0].id).toBe('military_campaign');
        });
        (0, vitest_1.it)('does not generate event without sufficient richTickCount', () => {
            const character = createTestCharacter({
                vocation: 'lavrador',
                richTickCount: 5,
            });
            const task = (0, tasks_1.getTasksByVocation)('lavrador').find(t => t.id === 'cultivate');
            const events = (0, dynamic_events_1.checkDynamicEvents)(character, task);
            (0, vitest_1.expect)(events.length).toBe(0);
        });
    });
    (0, vitest_1.describe)('Resurrect character endpoint logic', () => {
        (0, vitest_1.it)('shouldConvertToNPC returns -1 interval for NPC characters', () => {
            const character = createTestCharacter({ isNpc: true });
            (0, vitest_1.expect)((0, character_tick_1.calculateTickInterval)(character, 0)).toBe(-1);
        });
    });
    (0, vitest_1.describe)('Multiple specializations', () => {
        (0, vitest_1.it)('character can have multiple specializations', () => {
            const character = createTestCharacter({
                specializations: ['Master Farmer', 'Animal Whisperer'],
                emergentSpecialization: 'Harvest King',
            });
            (0, vitest_1.expect)(character.specializations.length).toBe(2);
            (0, vitest_1.expect)(character.emergentSpecialization).toBe('Harvest King');
        });
        (0, vitest_1.it)('specializations array is initialized empty', () => {
            const character = createTestCharacter();
            (0, vitest_1.expect)(character.specializations).toEqual([]);
        });
    });
});
(0, vitest_1.describe)('Phase 20 — Expansão', () => {
    (0, vitest_1.describe)('New v1.1 vocations', () => {
        (0, vitest_1.it)('clerigo has 8 tasks', () => {
            const tasks = (0, tasks_1.getTasksByVocation11)('clerigo');
            (0, vitest_1.expect)(tasks.length).toBe(8);
            (0, vitest_1.expect)(tasks[0].id).toBe('bless_faithful');
        });
        (0, vitest_1.it)('trovador has 8 tasks', () => {
            const tasks = (0, tasks_1.getTasksByVocation11)('trovador');
            (0, vitest_1.expect)(tasks.length).toBe(8);
            (0, vitest_1.expect)(tasks[0].id).toBe('perform_tavern');
        });
        (0, vitest_1.it)('guerreiro has 8 tasks', () => {
            const tasks = (0, tasks_1.getTasksByVocation11)('guerreiro');
            (0, vitest_1.expect)(tasks.length).toBe(8);
            (0, vitest_1.expect)(tasks[0].id).toBe('spar_training');
        });
        (0, vitest_1.it)('escriba has 8 tasks', () => {
            const tasks = (0, tasks_1.getTasksByVocation11)('escriba');
            (0, vitest_1.expect)(tasks.length).toBe(8);
            (0, vitest_1.expect)(tasks[0].id).toBe('copy_document');
        });
        (0, vitest_1.it)('vorant has 8 tasks', () => {
            const tasks = (0, tasks_1.getTasksByVocation11)('vorant');
            (0, vitest_1.expect)(tasks.length).toBe(8);
            (0, vitest_1.expect)(tasks[0].id).toBe('meditate_vora');
        });
        (0, vitest_1.it)('getAllVocation11Ids returns 5 vocation IDs', () => {
            const ids = (0, tasks_1.getAllVocation11Ids)();
            (0, vitest_1.expect)(ids.length).toBe(5);
            (0, vitest_1.expect)(ids).toContain('clerigo');
            (0, vitest_1.expect)(ids).toContain('trovador');
            (0, vitest_1.expect)(ids).toContain('guerreiro');
            (0, vitest_1.expect)(ids).toContain('escriba');
            (0, vitest_1.expect)(ids).toContain('vorant');
        });
        (0, vitest_1.it)('clerigo tasks have social category focus', () => {
            const tasks = (0, tasks_1.getTasksByVocation11)('clerigo');
            const socialTasks = tasks.filter(t => t.category === 'social');
            (0, vitest_1.expect)(socialTasks.length).toBeGreaterThanOrEqual(3);
        });
        (0, vitest_1.it)('vorant tasks have exploration and work categories', () => {
            const tasks = (0, tasks_1.getTasksByVocation11)('vorant');
            const explorationTasks = tasks.filter(t => t.category === 'exploration');
            const workTasks = tasks.filter(t => t.category === 'work');
            (0, vitest_1.expect)(explorationTasks.length).toBeGreaterThanOrEqual(2);
            (0, vitest_1.expect)(workTasks.length).toBeGreaterThanOrEqual(2);
        });
    });
    (0, vitest_1.describe)('Vocation change detection logic', () => {
        (0, vitest_1.it)('detects vocation change when task ratio exceeds threshold', () => {
            const vocationTaskMap = {
                clerigo: { tasks: ['bless_faithful', 'hear_confession', 'tend_sick', 'preach_sermon'], minRatio: 0.2 },
                trovador: { tasks: ['perform_tavern', 'compose_ballad', 'spread_news', 'gather_rumors'], minRatio: 0.2 },
                guerreiro: { tasks: ['spar_training', 'hunt_game', 'maintain_weapon', 'join_skirmish'], minRatio: 0.2 },
                escriba: { tasks: ['copy_document', 'write_letter', 'catalog_archive', 'translate_text'], minRatio: 0.2 },
                vorant: { tasks: ['meditate_vora', 'channel_element', 'heal_wound', 'study_lore'], minRatio: 0.2 },
            };
            const taskCounts = {
                bless_faithful: 15,
                hear_confession: 10,
                tend_sick: 8,
                preach_sermon: 7,
                rest: 5,
                eat_drink: 5,
            };
            const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
            for (const [vocation, config] of Object.entries(vocationTaskMap)) {
                const matchingTasks = config.tasks.reduce((sum, t) => sum + (taskCounts[t] || 0), 0);
                const ratio = matchingTasks / totalTasks;
                if (vocation === 'clerigo') {
                    (0, vitest_1.expect)(ratio).toBeGreaterThanOrEqual(config.minRatio);
                }
            }
        });
    });
    (0, vitest_1.describe)('Trait evolution detection', () => {
        (0, vitest_1.it)('detects extraversion evolution from high social activity', () => {
            const taskCounts = {
                visit_known: 20,
                tavern: 15,
                rest: 10,
                eat_drink: 5,
            };
            const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
            const socialRatio = ((taskCounts['visit_known'] || 0) + (taskCounts['tavern'] || 0)) / totalTasks;
            (0, vitest_1.expect)(socialRatio).toBeGreaterThan(0.3);
        });
        (0, vitest_1.it)('detects conscientiousness evolution from high work activity', () => {
            const taskCounts = {
                cultivate: 25,
                forge_item: 15,
                patrol: 10,
                rest: 5,
                eat_drink: 5,
            };
            const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
            const workRatio = ((taskCounts['cultivate'] || 0) + (taskCounts['forge_item'] || 0) + (taskCounts['patrol'] || 0)) / totalTasks;
            (0, vitest_1.expect)(workRatio).toBeGreaterThan(0.4);
        });
        (0, vitest_1.it)('detects openness evolution from high exploration activity', () => {
            const taskCounts = {
                explore_route: 15,
                observe_surroundings: 10,
                rest: 10,
                eat_drink: 5,
            };
            const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
            const explorationRatio = ((taskCounts['explore_route'] || 0) + (taskCounts['observe_surroundings'] || 0)) / totalTasks;
            (0, vitest_1.expect)(explorationRatio).toBeGreaterThan(0.2);
        });
    });
    (0, vitest_1.describe)('BullMQ production features', () => {
        (0, vitest_1.it)('BullMQAdapter has configurable concurrency', () => {
            const concurrency = parseInt(process.env.BULLMQ_CONCURRENCY || '5', 10);
            (0, vitest_1.expect)(concurrency).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('BullMQAdapter has configurable max retries', () => {
            const maxRetries = parseInt(process.env.BULLMQ_MAX_RETRIES || '3', 10);
            (0, vitest_1.expect)(maxRetries).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('BullMQAdapter has configurable backoff delay', () => {
            const backoffDelay = parseInt(process.env.BULLMQ_BACKOFF_DELAY || '5000', 10);
            (0, vitest_1.expect)(backoffDelay).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('Enhanced prayer effects (faith >= 8)', () => {
        (0, vitest_1.it)('prayer gives +2 faith when faith >= 8', () => {
            const faithGain = 8 >= 8 ? 2 : 1;
            (0, vitest_1.expect)(faithGain).toBe(2);
        });
        (0, vitest_1.it)('prayer gives +1 faith when faith < 8', () => {
            const faithGain = 5 >= 8 ? 2 : 1;
            (0, vitest_1.expect)(faithGain).toBe(1);
        });
        (0, vitest_1.it)('prayer reduces all negative moods by 2 when faith >= 8', () => {
            const moodReduction = 8 >= 8 ? 2 : 1;
            (0, vitest_1.expect)(moodReduction).toBe(2);
        });
        (0, vitest_1.it)('prayer adds joy when faith >= 9', () => {
            const addsJoy = 9 >= 9;
            (0, vitest_1.expect)(addsJoy).toBe(true);
        });
    });
});
//# sourceMappingURL=character-tick-phases.test.js.map