"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traitToModifier = traitToModifier;
function traitToModifier(value) {
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
//# sourceMappingURL=traits.js.map