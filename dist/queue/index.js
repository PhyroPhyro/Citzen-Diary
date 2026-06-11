"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueueAdapter = createQueueAdapter;
const stub_adapter_1 = require("./stub-adapter");
const bullmq_adapter_1 = require("./bullmq-adapter");
function createQueueAdapter() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
        return new bullmq_adapter_1.BullMQAdapter(redisUrl);
    }
    console.log('[Queue] No REDIS_URL found, using stub adapter');
    return new stub_adapter_1.StubQueueAdapter();
}
__exportStar(require("./adapter"), exports);
__exportStar(require("./stub-adapter"), exports);
__exportStar(require("./bullmq-adapter"), exports);
//# sourceMappingURL=index.js.map