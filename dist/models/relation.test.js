"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const relation_1 = require("./relation");
(0, vitest_1.describe)('affinityToModifier', () => {
    (0, vitest_1.it)('returns -2 for affinity -10 to -6', () => {
        (0, vitest_1.expect)((0, relation_1.affinityToModifier)(-10)).toBe(-2);
        (0, vitest_1.expect)((0, relation_1.affinityToModifier)(-6)).toBe(-1);
    });
    (0, vitest_1.it)('returns -1 for affinity -5 to -3', () => {
        (0, vitest_1.expect)((0, relation_1.affinityToModifier)(-5)).toBe(-1);
        (0, vitest_1.expect)((0, relation_1.affinityToModifier)(-3)).toBe(-1);
    });
    (0, vitest_1.it)('returns 0 for affinity -2 to 2', () => {
        (0, vitest_1.expect)(Math.abs((0, relation_1.affinityToModifier)(-2))).toBe(0);
        (0, vitest_1.expect)((0, relation_1.affinityToModifier)(0)).toBe(0);
        (0, vitest_1.expect)((0, relation_1.affinityToModifier)(2)).toBe(0);
    });
    (0, vitest_1.it)('returns +1 for affinity 3 to 5', () => {
        (0, vitest_1.expect)((0, relation_1.affinityToModifier)(3)).toBe(1);
        (0, vitest_1.expect)((0, relation_1.affinityToModifier)(5)).toBe(1);
    });
    (0, vitest_1.it)('returns +2 for affinity 6 to 10', () => {
        (0, vitest_1.expect)((0, relation_1.affinityToModifier)(6)).toBe(1);
        (0, vitest_1.expect)((0, relation_1.affinityToModifier)(10)).toBe(2);
    });
});
//# sourceMappingURL=relation.test.js.map