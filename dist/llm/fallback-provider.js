"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallbackLLMProvider = void 0;
const gemini_provider_1 = require("./gemini-provider");
const mock_provider_1 = require("./mock-provider");
class FallbackLLMProvider {
    primary;
    fallback;
    useFallback = false;
    constructor(apiKey, model) {
        this.primary = new gemini_provider_1.GeminiProvider(apiKey, model);
        this.fallback = new mock_provider_1.MockLLMProvider();
    }
    isQuotaError(error) {
        const msg = String(error);
        return msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests');
    }
    async generateDiaryEntry(_context) {
        if (this.useFallback)
            return this.fallback.generateDiaryEntry();
        try {
            return await this.primary.generateDiaryEntry(_context);
        }
        catch (error) {
            if (this.isQuotaError(error)) {
                console.warn('[LLM] Gemini quota exceeded, falling back to Mock provider');
                this.useFallback = true;
                return this.fallback.generateDiaryEntry();
            }
            throw error;
        }
    }
    async generateMilestone(_context) {
        if (this.useFallback)
            return this.fallback.generateMilestone();
        try {
            return await this.primary.generateMilestone(_context);
        }
        catch (error) {
            if (this.isQuotaError(error)) {
                console.warn('[LLM] Gemini quota exceeded, falling back to Mock provider');
                this.useFallback = true;
                return this.fallback.generateMilestone();
            }
            throw error;
        }
    }
    async generateSpecialization(_context) {
        if (this.useFallback)
            return this.fallback.generateSpecialization();
        try {
            return await this.primary.generateSpecialization(_context);
        }
        catch (error) {
            if (this.isQuotaError(error)) {
                console.warn('[LLM] Gemini quota exceeded, falling back to Mock provider');
                this.useFallback = true;
                return this.fallback.generateSpecialization();
            }
            throw error;
        }
    }
    async generateNPCProfile(_context) {
        if (this.useFallback)
            return this.fallback.generateNPCProfile();
        try {
            return await this.primary.generateNPCProfile(_context);
        }
        catch (error) {
            if (this.isQuotaError(error)) {
                console.warn('[LLM] Gemini quota exceeded, falling back to Mock provider');
                this.useFallback = true;
                return this.fallback.generateNPCProfile();
            }
            throw error;
        }
    }
    async generateBio(_context) {
        if (this.useFallback)
            return this.fallback.generateBio();
        try {
            return await this.primary.generateBio(_context);
        }
        catch (error) {
            if (this.isQuotaError(error)) {
                console.warn('[LLM] Gemini quota exceeded, falling back to Mock provider');
                this.useFallback = true;
                return this.fallback.generateBio();
            }
            throw error;
        }
    }
    async generateQuestBranch(_context) {
        if (this.useFallback)
            return this.fallback.generateQuestBranch();
        try {
            return await this.primary.generateQuestBranch(_context);
        }
        catch (error) {
            if (this.isQuotaError(error)) {
                console.warn('[LLM] Gemini quota exceeded, falling back to Mock provider');
                this.useFallback = true;
                return this.fallback.generateQuestBranch();
            }
            throw error;
        }
    }
}
exports.FallbackLLMProvider = FallbackLLMProvider;
//# sourceMappingURL=fallback-provider.js.map