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
exports.createLLMProvider = createLLMProvider;
const cerebras_provider_1 = require("./cerebras-provider");
const mock_provider_1 = require("./mock-provider");
const cascade_provider_1 = require("./cascade-provider");
function createLLMProvider() {
    const provider = process.env.LLM_PROVIDER || 'mock';
    const geminiKey = process.env.LLM_API_KEY || '';
    const geminiModel = process.env.LLM_MODEL || 'gemini-2.0-flash';
    const cerebrasKey = process.env.CEREBRAS_API_KEY || '';
    const cerebrasModel = process.env.CEREBRAS_MODEL || 'llama3.1-8b';
    if (provider === 'gemini' && geminiKey) {
        return new cascade_provider_1.CascadeLLMProvider(geminiKey, cerebrasKey || undefined);
    }
    if (provider === 'cerebras' && cerebrasKey) {
        return new cerebras_provider_1.CerebrasProvider(cerebrasKey, cerebrasModel);
    }
    return new mock_provider_1.MockLLMProvider();
}
__exportStar(require("./provider"), exports);
__exportStar(require("./gemini-provider"), exports);
__exportStar(require("./cerebras-provider"), exports);
__exportStar(require("./mock-provider"), exports);
__exportStar(require("./cascade-provider"), exports);
//# sourceMappingURL=index.js.map