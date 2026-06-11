"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const mood_1 = require("./mood");
(0, vitest_1.describe)('getDominantMood', () => {
    (0, vitest_1.it)('returns joy state when joy is highest', () => {
        const mood = { joy: 8, sadness: 2, anger: 1, fear: 2, disgust: 1, surprise: 3 };
        const result = (0, mood_1.getDominantMood)(mood);
        (0, vitest_1.expect)(result.state).toBe('animado');
        (0, vitest_1.expect)(result.value).toBe(8);
    });
    (0, vitest_1.it)('returns sadness state when sadness is highest', () => {
        const mood = { joy: 2, sadness: 9, anger: 1, fear: 2, disgust: 1, surprise: 1 };
        const result = (0, mood_1.getDominantMood)(mood);
        (0, vitest_1.expect)(result.state).toBe('melancolico');
    });
    (0, vitest_1.it)('returns anger state when anger is highest', () => {
        const mood = { joy: 2, sadness: 1, anger: 7, fear: 2, disgust: 1, surprise: 1 };
        const result = (0, mood_1.getDominantMood)(mood);
        (0, vitest_1.expect)(result.state).toBe('irritado');
    });
    (0, vitest_1.it)('returns fear state when fear is highest', () => {
        const mood = { joy: 2, sadness: 1, anger: 1, fear: 8, disgust: 1, surprise: 1 };
        const result = (0, mood_1.getDominantMood)(mood);
        (0, vitest_1.expect)(result.state).toBe('ansioso');
    });
    (0, vitest_1.it)('returns disgust state when disgust is highest', () => {
        const mood = { joy: 2, sadness: 1, anger: 1, fear: 2, disgust: 7, surprise: 1 };
        const result = (0, mood_1.getDominantMood)(mood);
        (0, vitest_1.expect)(result.state).toBe('repulsado');
    });
    (0, vitest_1.it)('returns surprise state when surprise is highest', () => {
        const mood = { joy: 2, sadness: 1, anger: 1, fear: 2, disgust: 1, surprise: 8 };
        const result = (0, mood_1.getDominantMood)(mood);
        (0, vitest_1.expect)(result.state).toBe('surpreso');
    });
    (0, vitest_1.it)('returns neutro when dominant emotion value is <= 3', () => {
        const mood = { joy: 3, sadness: 2, anger: 1, fear: 2, disgust: 1, surprise: 2 };
        const result = (0, mood_1.getDominantMood)(mood);
        (0, vitest_1.expect)(result.state).toBe('neutro');
    });
});
(0, vitest_1.describe)('getMoodModifier', () => {
    (0, vitest_1.it)('returns -2 for values 0-1', () => {
        (0, vitest_1.expect)((0, mood_1.getMoodModifier)(0)).toBe(-2);
        (0, vitest_1.expect)((0, mood_1.getMoodModifier)(1)).toBe(-2);
    });
    (0, vitest_1.it)('returns -1 for values 2-3', () => {
        (0, vitest_1.expect)((0, mood_1.getMoodModifier)(2)).toBe(-1);
        (0, vitest_1.expect)((0, mood_1.getMoodModifier)(3)).toBe(-1);
    });
    (0, vitest_1.it)('returns 0 for values 4-5', () => {
        (0, vitest_1.expect)((0, mood_1.getMoodModifier)(4)).toBe(0);
        (0, vitest_1.expect)((0, mood_1.getMoodModifier)(5)).toBe(0);
    });
    (0, vitest_1.it)('returns +1 for values 6-7', () => {
        (0, vitest_1.expect)((0, mood_1.getMoodModifier)(6)).toBe(1);
        (0, vitest_1.expect)((0, mood_1.getMoodModifier)(7)).toBe(1);
    });
    (0, vitest_1.it)('returns +2 for values 8-9', () => {
        (0, vitest_1.expect)((0, mood_1.getMoodModifier)(8)).toBe(2);
        (0, vitest_1.expect)((0, mood_1.getMoodModifier)(9)).toBe(2);
    });
    (0, vitest_1.it)('returns +3 for value 10', () => {
        (0, vitest_1.expect)((0, mood_1.getMoodModifier)(10)).toBe(3);
    });
});
//# sourceMappingURL=mood.test.js.map