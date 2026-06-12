"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const mood_1 = require("./mood");
(0, vitest_1.describe)('Mood Decay — Phase 19 Enhancements', () => {
    (0, vitest_1.describe)('decayMood returns to neutral over time', () => {
        (0, vitest_1.it)('decays high joy towards 5', () => {
            const mood = { joy: 9, sadness: 1, anger: 1, fear: 1, disgust: 1, surprise: 1 };
            const decayed = (0, mood_1.decayMood)(mood, 2);
            (0, vitest_1.expect)(decayed.joy).toBeLessThan(9);
            (0, vitest_1.expect)(decayed.joy).toBeGreaterThan(5);
        });
        (0, vitest_1.it)('decays high sadness towards 0', () => {
            const mood = { joy: 5, sadness: 9, anger: 1, fear: 1, disgust: 1, surprise: 1 };
            const decayed = (0, mood_1.decayMood)(mood, 2);
            (0, vitest_1.expect)(decayed.sadness).toBeLessThan(9);
        });
        (0, vitest_1.it)('decays high anger towards 0', () => {
            const mood = { joy: 5, sadness: 1, anger: 9, fear: 1, disgust: 1, surprise: 1 };
            const decayed = (0, mood_1.decayMood)(mood, 2);
            (0, vitest_1.expect)(decayed.anger).toBeLessThan(9);
        });
        (0, vitest_1.it)('decays high fear towards 0', () => {
            const mood = { joy: 5, sadness: 1, anger: 1, fear: 9, disgust: 1, surprise: 1 };
            const decayed = (0, mood_1.decayMood)(mood, 2);
            (0, vitest_1.expect)(decayed.fear).toBeLessThan(9);
        });
        (0, vitest_1.it)('decays high disgust towards 0', () => {
            const mood = { joy: 5, sadness: 1, anger: 1, fear: 1, disgust: 9, surprise: 1 };
            const decayed = (0, mood_1.decayMood)(mood, 2);
            (0, vitest_1.expect)(decayed.disgust).toBeLessThan(9);
        });
        (0, vitest_1.it)('decays high surprise towards 0', () => {
            const mood = { joy: 5, sadness: 1, anger: 1, fear: 1, disgust: 1, surprise: 9 };
            const decayed = (0, mood_1.decayMood)(mood, 2);
            (0, vitest_1.expect)(decayed.surprise).toBeLessThan(9);
        });
        (0, vitest_1.it)('low joy increases towards 5', () => {
            const mood = { joy: 1, sadness: 5, anger: 5, fear: 5, disgust: 5, surprise: 5 };
            const decayed = (0, mood_1.decayMood)(mood, 2);
            (0, vitest_1.expect)(decayed.joy).toBeGreaterThan(1);
        });
        (0, vitest_1.it)('clamps values between 0 and 10', () => {
            const mood = { joy: 10, sadness: 10, anger: 10, fear: 10, disgust: 10, surprise: 10 };
            const decayed = (0, mood_1.decayMood)(mood, 10);
            for (const value of Object.values(decayed)) {
                (0, vitest_1.expect)(value).toBeGreaterThanOrEqual(0);
                (0, vitest_1.expect)(value).toBeLessThanOrEqual(10);
            }
        });
    });
});
//# sourceMappingURL=mood-phases.test.js.map