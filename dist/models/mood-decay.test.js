"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const mood_1 = require("./mood");
(0, vitest_1.describe)('decayMood', () => {
    (0, vitest_1.it)('returns mood towards neutral after elapsed time', () => {
        const mood = { joy: 9, sadness: 8, anger: 7, fear: 6, disgust: 5, surprise: 4 };
        const decayed = (0, mood_1.decayMood)(mood, 2);
        (0, vitest_1.expect)(decayed.joy).toBeLessThan(mood.joy);
        (0, vitest_1.expect)(decayed.sadness).toBeLessThan(mood.sadness);
        (0, vitest_1.expect)(decayed.anger).toBeLessThan(mood.anger);
        (0, vitest_1.expect)(decayed.fear).toBeLessThan(mood.fear);
    });
    (0, vitest_1.it)('does not change mood when no time elapsed', () => {
        const mood = { joy: 8, sadness: 5, anger: 3, fear: 2, disgust: 4, surprise: 6 };
        const decayed = (0, mood_1.decayMood)(mood, 0);
        (0, vitest_1.expect)(decayed.joy).toBe(8);
        (0, vitest_1.expect)(decayed.sadness).toBe(5);
        (0, vitest_1.expect)(decayed.anger).toBe(3);
    });
    (0, vitest_1.it)('clamps values between 0 and 10', () => {
        const mood = { joy: 0, sadness: 10, anger: 10, fear: 10, disgust: 10, surprise: 10 };
        const decayed = (0, mood_1.decayMood)(mood, 5);
        for (const value of Object.values(decayed)) {
            (0, vitest_1.expect)(value).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(value).toBeLessThanOrEqual(10);
        }
    });
    (0, vitest_1.it)('moves joy towards 5 (neutral) over time', () => {
        const highJoy = (0, mood_1.decayMood)({ joy: 10, sadness: 0, anger: 0, fear: 0, disgust: 0, surprise: 0 }, 3);
        const lowJoy = (0, mood_1.decayMood)({ joy: 1, sadness: 0, anger: 0, fear: 0, disgust: 0, surprise: 0 }, 3);
        (0, vitest_1.expect)(highJoy.joy).toBeLessThan(10);
        (0, vitest_1.expect)(lowJoy.joy).toBeGreaterThan(1);
    });
    (0, vitest_1.it)('reduces negative emotions over time', () => {
        const mood = { joy: 2, sadness: 9, anger: 8, fear: 7, disgust: 6, surprise: 3 };
        const decayed = (0, mood_1.decayMood)(mood, 4);
        (0, vitest_1.expect)(decayed.sadness).toBeLessThan(9);
        (0, vitest_1.expect)(decayed.anger).toBeLessThan(8);
        (0, vitest_1.expect)(decayed.fear).toBeLessThan(7);
        (0, vitest_1.expect)(decayed.disgust).toBeLessThan(6);
    });
});
//# sourceMappingURL=mood-decay.test.js.map