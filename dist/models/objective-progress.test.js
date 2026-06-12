"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const objective_1 = require("./objective");
(0, vitest_1.describe)('calculateObjectiveProgress', () => {
    (0, vitest_1.it)('returns higher progress for aligned task categories', () => {
        const economicProgress = (0, objective_1.calculateObjectiveProgress)('sell_goods', 'economic');
        const restProgress = (0, objective_1.calculateObjectiveProgress)('sell_goods', 'spiritual');
        (0, vitest_1.expect)(economicProgress).toBeGreaterThan(restProgress);
    });
    (0, vitest_1.it)('returns progress for social tasks with social objective', () => {
        const progress = (0, objective_1.calculateObjectiveProgress)('visit_known', 'social');
        (0, vitest_1.expect)(progress).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('returns progress for exploration tasks with exploratory objective', () => {
        const progress = (0, objective_1.calculateObjectiveProgress)('explore_route', 'exploratory');
        (0, vitest_1.expect)(progress).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('returns progress for work tasks with military objective', () => {
        const progress = (0, objective_1.calculateObjectiveProgress)('patrol', 'military');
        (0, vitest_1.expect)(progress).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('returns progress for work tasks with artisanal objective', () => {
        const progress = (0, objective_1.calculateObjectiveProgress)('forge_item', 'artisanal');
        (0, vitest_1.expect)(progress).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('returns lower progress for non-aligned tasks', () => {
        const alignedProgress = (0, objective_1.calculateObjectiveProgress)('cultivate', 'economic');
        const nonAlignedProgress = (0, objective_1.calculateObjectiveProgress)('cultivate', 'spiritual');
        (0, vitest_1.expect)(alignedProgress).toBeGreaterThan(nonAlignedProgress);
    });
    (0, vitest_1.it)('returns base progress for unknown tasks', () => {
        const progress = (0, objective_1.calculateObjectiveProgress)('unknown_task', 'economic');
        (0, vitest_1.expect)(progress).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('caps progress calculation reasonably', () => {
        const progress = (0, objective_1.calculateObjectiveProgress)('negotiate_lord', 'economic');
        (0, vitest_1.expect)(progress).toBeLessThanOrEqual(5);
    });
});
//# sourceMappingURL=objective-progress.test.js.map