"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDominantMood = getDominantMood;
exports.getMoodModifier = getMoodModifier;
function getDominantMood(mood) {
    const entries = Object.entries(mood);
    const [dominantEmotion, dominantValue] = entries.reduce((max, entry) => (entry[1] > max[1] ? entry : max), entries[0]);
    const stateMap = {
        joy: 'animado',
        sadness: 'melancolico',
        anger: 'irritado',
        fear: 'ansioso',
        disgust: 'repulsado',
        surprise: 'surpreso',
    };
    if (dominantValue <= 3)
        return { state: 'neutro', value: dominantValue };
    return { state: stateMap[dominantEmotion], value: dominantValue };
}
function getMoodModifier(value) {
    if (value <= 1)
        return -2;
    if (value <= 3)
        return -1;
    if (value <= 5)
        return 0;
    if (value <= 7)
        return 1;
    if (value <= 9)
        return 2;
    return 3;
}
//# sourceMappingURL=mood.js.map