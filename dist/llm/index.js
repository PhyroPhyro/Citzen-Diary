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
const gemini_provider_1 = require("./gemini-provider");
const mock_provider_1 = require("./mock-provider");
function createLLMProvider() {
    const provider = process.env.LLM_PROVIDER || 'mock';
    const apiKey = process.env.LLM_API_KEY || '';
    const model = process.env.LLM_MODEL || 'gemini-2.0-flash';
    if (provider === 'gemini' && apiKey) {
        return new gemini_provider_1.GeminiProvider(apiKey, model);
    }
    return new mock_provider_1.MockLLMProvider();
}
__exportStar(require("./provider"), exports);
__exportStar(require("./gemini-provider"), exports);
__exportStar(require("./mock-provider"), exports);
//# sourceMappingURL=index.js.map