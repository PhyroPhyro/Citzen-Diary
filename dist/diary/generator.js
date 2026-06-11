"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTemplateEntry = generateTemplateEntry;
const templates_1 = require("../data/templates");
const mood_1 = require("../models/mood");
function generateTemplateEntry(character, task) {
    const template = (0, templates_1.getTemplateForTask)(task.id);
    const { state: moodState } = (0, mood_1.getDominantMood)(character.mood);
    let text;
    if (template) {
        const variationIndex = Math.floor(Math.random() * template.variations.length);
        const base = template.variations[variationIndex];
        const suffix = (0, templates_1.getToneSuffix)(template, moodState);
        text = suffix ? `${base} ${suffix}` : base;
    }
    else {
        text = 'O dia passou sem grandes eventos.';
    }
    return {
        id: crypto.randomUUID(),
        characterId: character.id,
        text,
        source: 'template',
        occurredAt: new Date(),
        createdAt: new Date(),
        locationId: character.locationId,
        locationName: 'Desconhecido',
        taskId: task.id,
        moodState,
        isGrouped: false,
        groupCount: null,
        isAnchored: false,
        milestoneId: null,
    };
}
//# sourceMappingURL=generator.js.map