"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommitmentModifier = getCommitmentModifier;
function getCommitmentModifier(ticksRemaining) {
    if (ticksRemaining > 3)
        return 1;
    if (ticksRemaining >= 2)
        return 2;
    if (ticksRemaining >= 1)
        return 3;
    return 3;
}
//# sourceMappingURL=objective.js.map