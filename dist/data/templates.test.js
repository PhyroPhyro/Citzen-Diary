"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const templates_1 = require("./templates");
(0, vitest_1.describe)('getTemplateForTask', () => {
    (0, vitest_1.it)('returns rest template for rest task', () => {
        const template = (0, templates_1.getTemplateForTask)('rest');
        (0, vitest_1.expect)(template).not.toBeNull();
        (0, vitest_1.expect)(template?.id).toBe('rest');
    });
    (0, vitest_1.it)('returns work_lavrador template for cultivate task', () => {
        const template = (0, templates_1.getTemplateForTask)('cultivate');
        (0, vitest_1.expect)(template).not.toBeNull();
        (0, vitest_1.expect)(template?.id).toBe('work_lavrador');
    });
    (0, vitest_1.it)('returns work_artesao template for forge_item task', () => {
        const template = (0, templates_1.getTemplateForTask)('forge_item');
        (0, vitest_1.expect)(template).not.toBeNull();
        (0, vitest_1.expect)(template?.id).toBe('work_artesao');
    });
    (0, vitest_1.it)('returns patrol template for patrol task', () => {
        const template = (0, templates_1.getTemplateForTask)('patrol');
        (0, vitest_1.expect)(template).not.toBeNull();
        (0, vitest_1.expect)(template?.id).toBe('patrol');
    });
    (0, vitest_1.it)('returns travel template for deliver_message task', () => {
        const template = (0, templates_1.getTemplateForTask)('deliver_message');
        (0, vitest_1.expect)(template).not.toBeNull();
        (0, vitest_1.expect)(template?.id).toBe('travel');
    });
    (0, vitest_1.it)('returns commerce template for buy_goods task', () => {
        const template = (0, templates_1.getTemplateForTask)('buy_goods');
        (0, vitest_1.expect)(template).not.toBeNull();
        (0, vitest_1.expect)(template?.id).toBe('commerce');
    });
    (0, vitest_1.it)('returns stroll template for observe_surroundings task', () => {
        const template = (0, templates_1.getTemplateForTask)('observe_surroundings');
        (0, vitest_1.expect)(template).not.toBeNull();
        (0, vitest_1.expect)(template?.id).toBe('stroll');
    });
    (0, vitest_1.it)('returns null for unmapped task', () => {
        const template = (0, templates_1.getTemplateForTask)('nonexistent_task');
        (0, vitest_1.expect)(template).toBeNull();
    });
});
(0, vitest_1.describe)('getToneSuffix', () => {
    (0, vitest_1.it)('returns positive suffix for animado mood', () => {
        const template = templates_1.DIARY_TEMPLATES[0];
        const suffix = (0, templates_1.getToneSuffix)(template, 'animado');
        (0, vitest_1.expect)(suffix).toBe(template.positiveSuffix);
    });
    (0, vitest_1.it)('returns positive suffix for surpreso mood', () => {
        const template = templates_1.DIARY_TEMPLATES[0];
        const suffix = (0, templates_1.getToneSuffix)(template, 'surpreso');
        (0, vitest_1.expect)(suffix).toBe(template.positiveSuffix);
    });
    (0, vitest_1.it)('returns negative suffix for melancolico mood', () => {
        const template = templates_1.DIARY_TEMPLATES[0];
        const suffix = (0, templates_1.getToneSuffix)(template, 'melancolico');
        (0, vitest_1.expect)(suffix).toBe(template.negativeSuffix);
    });
    (0, vitest_1.it)('returns negative suffix for ansioso mood', () => {
        const template = templates_1.DIARY_TEMPLATES[0];
        const suffix = (0, templates_1.getToneSuffix)(template, 'ansioso');
        (0, vitest_1.expect)(suffix).toBe(template.negativeSuffix);
    });
    (0, vitest_1.it)('returns empty string for neutro mood', () => {
        const template = templates_1.DIARY_TEMPLATES[0];
        const suffix = (0, templates_1.getToneSuffix)(template, 'neutro');
        (0, vitest_1.expect)(suffix).toBe('');
    });
    (0, vitest_1.it)('returns empty string for irritado mood', () => {
        const template = templates_1.DIARY_TEMPLATES[0];
        const suffix = (0, templates_1.getToneSuffix)(template, 'irritado');
        (0, vitest_1.expect)(suffix).toBe('');
    });
});
(0, vitest_1.describe)('DIARY_TEMPLATES', () => {
    (0, vitest_1.it)('has 7 categories', () => {
        (0, vitest_1.expect)(templates_1.DIARY_TEMPLATES.length).toBe(7);
    });
    (0, vitest_1.it)('each category has 5 variations', () => {
        for (const category of templates_1.DIARY_TEMPLATES) {
            (0, vitest_1.expect)(category.variations.length).toBe(5);
        }
    });
    (0, vitest_1.it)('each category has positive and negative suffixes', () => {
        for (const category of templates_1.DIARY_TEMPLATES) {
            (0, vitest_1.expect)(category.positiveSuffix.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(category.negativeSuffix.length).toBeGreaterThan(0);
        }
    });
});
//# sourceMappingURL=templates.test.js.map