"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const objective_1 = require("./objective");
(0, vitest_1.describe)('getCommitmentModifier', () => {
    (0, vitest_1.it)('returns +1 for more than 3 ticks remaining', () => {
        (0, vitest_1.expect)((0, objective_1.getCommitmentModifier)(4)).toBe(1);
        (0, vitest_1.expect)((0, objective_1.getCommitmentModifier)(10)).toBe(1);
    });
    (0, vitest_1.it)('returns +2 for 2-3 ticks remaining', () => {
        (0, vitest_1.expect)((0, objective_1.getCommitmentModifier)(2)).toBe(2);
        (0, vitest_1.expect)((0, objective_1.getCommitmentModifier)(3)).toBe(2);
    });
    (0, vitest_1.it)('returns +3 for 1 tick remaining (urgent)', () => {
        (0, vitest_1.expect)((0, objective_1.getCommitmentModifier)(1)).toBe(3);
    });
    (0, vitest_1.it)('returns +3 for overdue (0 or negative)', () => {
        (0, vitest_1.expect)((0, objective_1.getCommitmentModifier)(0)).toBe(3);
        (0, vitest_1.expect)((0, objective_1.getCommitmentModifier)(-1)).toBe(3);
    });
});
//# sourceMappingURL=objective.test.js.map