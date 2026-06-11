"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const traits_1 = require("./traits");
(0, vitest_1.describe)('traitToModifier', () => {
    (0, vitest_1.it)('returns -2 for values 0-1', () => {
        (0, vitest_1.expect)((0, traits_1.traitToModifier)(0)).toBe(-2);
        (0, vitest_1.expect)((0, traits_1.traitToModifier)(1)).toBe(-2);
    });
    (0, vitest_1.it)('returns -1 for values 2-3', () => {
        (0, vitest_1.expect)((0, traits_1.traitToModifier)(2)).toBe(-1);
        (0, vitest_1.expect)((0, traits_1.traitToModifier)(3)).toBe(-1);
    });
    (0, vitest_1.it)('returns 0 for values 4-5', () => {
        (0, vitest_1.expect)((0, traits_1.traitToModifier)(4)).toBe(0);
        (0, vitest_1.expect)((0, traits_1.traitToModifier)(5)).toBe(0);
    });
    (0, vitest_1.it)('returns +1 for values 6-7', () => {
        (0, vitest_1.expect)((0, traits_1.traitToModifier)(6)).toBe(1);
        (0, vitest_1.expect)((0, traits_1.traitToModifier)(7)).toBe(1);
    });
    (0, vitest_1.it)('returns +2 for values 8-9', () => {
        (0, vitest_1.expect)((0, traits_1.traitToModifier)(8)).toBe(2);
        (0, vitest_1.expect)((0, traits_1.traitToModifier)(9)).toBe(2);
    });
    (0, vitest_1.it)('returns +3 for value 10', () => {
        (0, vitest_1.expect)((0, traits_1.traitToModifier)(10)).toBe(3);
    });
});
//# sourceMappingURL=traits.test.js.map