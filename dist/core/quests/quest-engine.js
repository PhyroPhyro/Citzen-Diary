"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkQuestAvailability = checkQuestAvailability;
exports.getAvailableQuests = getAvailableQuests;
exports.startQuest = startQuest;
exports.advanceQuestStep = advanceQuestStep;
exports.resolveQuestBranch = resolveQuestBranch;
exports.getQuestMilestoneTrigger = getQuestMilestoneTrigger;
exports.getQuestProgressKey = getQuestProgressKey;
const quests_1 = require("../../data/quests");
function generateQuestId() {
    return `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
function checkQuestAvailability(character, template) {
    if (template.requirements?.vocation && template.requirements.vocation !== character.vocation)
        return false;
    if (template.requirements?.minFaith && character.faith < template.requirements.minFaith)
        return false;
    if (template.requirements?.minTraits) {
        for (const [trait, minVal] of Object.entries(template.requirements.minTraits)) {
            if (character.traits[trait] < minVal)
                return false;
        }
    }
    return true;
}
function getAvailableQuests(character) {
    return quests_1.QUEST_TEMPLATES.filter((t) => checkQuestAvailability(character, t));
}
async function startQuest(character, templateId, db) {
    const template = (0, quests_1.getQuestTemplate)(templateId);
    if (!template)
        return null;
    if (!checkQuestAvailability(character, template))
        return null;
    const quest = {
        id: generateQuestId(),
        characterId: character.id,
        templateId,
        title: template.title,
        description: template.description,
        state: 'active',
        currentStepId: template.steps[0]?.id || null,
        completedSteps: [],
        startedAt: new Date(),
        completedAt: null,
        failedAt: null,
        tier: template.tier,
        rewards: template.rewards,
    };
    await db.quests.create(quest);
    return quest;
}
async function advanceQuestStep(quest, character, taskId, locationId, llm, db) {
    if (quest.state !== 'active' && quest.state !== 'in_progress')
        return null;
    const template = (0, quests_1.getQuestTemplate)(quest.templateId);
    if (!template)
        return null;
    const currentStepDef = template.steps.find((s) => s.id === quest.currentStepId);
    if (!currentStepDef)
        return null;
    if (currentStepDef.taskId && currentStepDef.taskId !== taskId) {
        if (!currentStepDef.progressTaskCategory)
            return null;
    }
    const completed = [...quest.completedSteps, currentStepDef.id];
    if (currentStepDef.choices && currentStepDef.choices.length > 0) {
        const chosen = await resolveQuestBranch(currentStepDef, character, llm);
        if (!chosen)
            return null;
        const nextStep = template.steps.find((s) => s.id === chosen.nextStepId);
        if (!nextStep)
            return null;
        quest.currentStepId = nextStep.id;
        quest.completedSteps = completed;
        quest.state = 'in_progress';
    }
    else if (currentStepDef.isFinal) {
        quest.state = 'completed';
        quest.completedAt = new Date();
        quest.currentStepId = null;
        quest.completedSteps = completed;
        await applyQuestRewards(quest, character, db);
    }
    else {
        const nextStepIndex = template.steps.indexOf(currentStepDef) + 1;
        if (nextStepIndex < template.steps.length) {
            quest.currentStepId = template.steps[nextStepIndex].id;
            quest.completedSteps = completed;
            quest.state = 'in_progress';
        }
        else {
            quest.state = 'completed';
            quest.completedAt = new Date();
            quest.currentStepId = null;
            quest.completedSteps = completed;
            await applyQuestRewards(quest, character, db);
        }
    }
    await db.quests.update(quest.id, quest);
    return quest;
}
async function resolveQuestBranch(step, character, llm) {
    if (!step.choices || step.choices.length === 0)
        return null;
    const validChoices = step.choices.filter((c) => {
        if (c.faithRequirement && character.faith < c.faithRequirement)
            return false;
        if (c.traitRequirements) {
            for (const req of c.traitRequirements) {
                if (character.traits[req.trait] < req.minValue)
                    return false;
            }
        }
        return true;
    });
    if (validChoices.length === 0)
        return null;
    if (validChoices.length === 1)
        return { nextStepId: validChoices[0].nextStepId, reason: 'only_choice' };
    const context = buildQuestContext(character, step, validChoices);
    try {
        const result = await llm.generateQuestBranch(context);
        const chosen = validChoices.find((c) => c.nextStepId === result.nextStepId);
        if (!chosen) {
            const defaultChoice = validChoices[0];
            return { nextStepId: defaultChoice.nextStepId, reason: 'llm_fallback' };
        }
        return { nextStepId: chosen.nextStepId, reason: 'llm_choice' };
    }
    catch {
        const defaultChoice = validChoices[0];
        return { nextStepId: defaultChoice.nextStepId, reason: 'error_fallback' };
    }
}
function buildQuestContext(character, step, choices) {
    const traitDesc = `Traços: Abertura=${character.traits.openness}, Consciência=${character.traits.conscientiousness}, Extroversão=${character.traits.extraversion}, Estabilidade=${character.traits.emotionalStability}, Agradabilidade=${character.traits.agreeableness}`;
    const choicesDesc = choices.map((c, i) => `[${i}] ${c.text}${c.condition ? ` (${c.condition})` : ''}`).join('\n');
    return `[PERSONAGEM]\nNome: ${character.name}\nVocação: ${character.vocation}\n${traitDesc}\nFé: ${character.faith}\n\n[SITUAÇÃO]\n${step.description}\n\n[ESCOLHAS]\n${choicesDesc}\n\n[INSTRUÇÃO]\nEscolha o índice numérico da opção mais adequada para este personagem. Responda APENAS com o número.`;
}
async function applyQuestRewards(quest, character, db) {
    const rewards = quest.rewards;
    if (!rewards)
        return;
    if (rewards.gold) {
        try {
            const inv = await db.economy.getInventory(character.id);
            await db.economy.updateGold(character.id, inv.gold + rewards.gold);
        }
        catch { }
    }
    if (rewards.faith) {
        const newFaith = Math.min(10, character.faith + rewards.faith);
        await db.character.update(character.id, { faith: newFaith });
        character.faith = newFaith;
    }
    if (rewards.items && rewards.items.length > 0) {
        for (const item of rewards.items) {
            try {
                await db.economy.updateInventory(character.id, item.resourceId, item.quantity);
            }
            catch { }
        }
    }
    if (rewards.traitChanges) {
        const updatedTraits = { ...character.traits };
        for (const [trait, delta] of Object.entries(rewards.traitChanges)) {
            updatedTraits[trait] = Math.max(0, Math.min(10, updatedTraits[trait] + delta));
        }
        character.traits = updatedTraits;
        await db.character.update(character.id, { traits: updatedTraits });
    }
}
function getQuestMilestoneTrigger(quest) {
    if (quest.state !== 'completed')
        return null;
    if (quest.tier >= 3)
        return 'critical_survival';
    if (quest.tier >= 2)
        return 'objective_achieved';
    return 'small_economic_social_achievement';
}
function getQuestProgressKey(taskId) {
    const progressMap = {
        cultivate: 'qbh_1',
        process_raw: 'qbh_2',
        harvest: 'qbh_4',
        buy_goods: 'qmh_1',
        explore_route: 'qmh_3',
        negotiate_supply: 'qmh_4',
        sell_goods: 'qmh_5',
        patrol: 'qbt_1',
        defend_post: 'qbt_2',
        arrest_suspect: 'qbt_3',
        forge_item: 'qgi_1',
        repair_item: 'qgi_2',
        receive_order: 'qgi_3',
        send_commercial_message: 'qtr_4',
        gather_herbs: 'qhm_1',
        heal_wound: 'qhm_2',
        tend_sick: 'qhm_3',
        catalog_archive: 'qal_2',
        translate_text: 'qal_3',
        teach_literacy: 'qal_4',
        compose_ballad: 'qpn_1',
        teach_song: 'qpn_2',
        perform_tavern: 'qpn_3',
        meditate_vora: 'qva_1',
        scry_vision: 'qva_2',
        ritual_weather: 'qva_3',
        spar_training: 'qrc_1',
        maintain_weapon: 'qrc_2',
        challenge_rival: 'qrc_3',
        teach_combat: 'qrc_4',
        mercenary_contract: 'qrc_5',
    };
    return progressMap[taskId] || '';
}
//# sourceMappingURL=quest-engine.js.map