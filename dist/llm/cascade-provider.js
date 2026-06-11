"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CascadeLLMProvider = void 0;
const gemini_provider_1 = require("./gemini-provider");
const cerebras_provider_1 = require("./cerebras-provider");
const mock_provider_1 = require("./mock-provider");
class CascadeLLMProvider {
    gemini = null;
    cerebras = null;
    mock;
    currentLevel = 'gemini';
    lastGeminiFailure = 0;
    GEMINI_RETRY_INTERVAL = 60 * 60 * 1000;
    constructor(geminiApiKey, cerebrasApiKey) {
        this.mock = new mock_provider_1.MockLLMProvider();
        if (geminiApiKey) {
            this.gemini = new gemini_provider_1.GeminiProvider(geminiApiKey);
        }
        if (cerebrasApiKey) {
            this.cerebras = new cerebras_provider_1.CerebrasProvider(cerebrasApiKey);
        }
    }
    get activeProvider() {
        return this.currentLevel;
    }
    resetToGemini() {
        if (this.currentLevel !== 'gemini' && this.gemini) {
            const timeSinceFailure = Date.now() - this.lastGeminiFailure;
            if (timeSinceFailure >= this.GEMINI_RETRY_INTERVAL) {
                console.log('[LLM] Retrying Gemini after cooldown...');
                this.currentLevel = 'gemini';
            }
        }
    }
    isQuotaError(error) {
        const msg = String(error);
        return msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests') || msg.includes('rate limit');
    }
    async tryGemini(fn) {
        if (!this.gemini)
            throw new Error('Gemini not configured');
        try {
            const result = await fn();
            return { result, provider: 'gemini' };
        }
        catch (error) {
            if (this.isQuotaError(error)) {
                this.lastGeminiFailure = Date.now();
                console.warn('[LLM] Gemini quota exceeded, trying Cerebras...');
                this.currentLevel = 'cerebras';
                throw error;
            }
            throw error;
        }
    }
    async tryCerebras(fn) {
        if (!this.cerebras) {
            console.error('[LLM] Cerebras provider is not configured (missing API key?)');
            throw new Error('Cerebras not configured');
        }
        try {
            const result = await fn();
            return { result, provider: 'cerebras' };
        }
        catch (error) {
            console.error('[LLM] Cerebras failed:', error);
            if (this.isQuotaError(error)) {
                console.warn('[LLM] Cerebras quota exceeded, falling back to Mock...');
                this.currentLevel = 'mock';
                throw error;
            }
            throw error;
        }
    }
    async generateDiaryEntry(context) {
        if (this.currentLevel === 'mock')
            return this.mock.generateDiaryEntry();
        if (this.currentLevel === 'gemini' && this.gemini) {
            try {
                const { result } = await this.tryGemini(() => this.gemini.generateDiaryEntry(context));
                return result;
            }
            catch {
                // fell through to cerebras or mock
            }
        }
        if (this.currentLevel === 'cerebras' && this.cerebras) {
            try {
                const { result } = await this.tryCerebras(() => this.cerebras.generateDiaryEntry(context));
                return result;
            }
            catch {
                // fell through to mock
            }
        }
        console.warn('[LLM] All providers failed, using Mock');
        this.currentLevel = 'mock';
        return this.mock.generateDiaryEntry();
    }
    async generateMilestone(context) {
        if (this.currentLevel === 'mock')
            return this.mock.generateMilestone();
        if (this.currentLevel === 'gemini' && this.gemini) {
            try {
                const { result } = await this.tryGemini(() => this.gemini.generateMilestone(context));
                return result;
            }
            catch {
                // fell through
            }
        }
        if (this.currentLevel === 'cerebras' && this.cerebras) {
            try {
                const { result } = await this.tryCerebras(() => this.cerebras.generateMilestone(context));
                return result;
            }
            catch {
                // fell through
            }
        }
        console.warn('[LLM] All providers failed, using Mock');
        this.currentLevel = 'mock';
        return this.mock.generateMilestone();
    }
    async generateSpecialization(context) {
        if (this.currentLevel === 'mock')
            return this.mock.generateSpecialization();
        if (this.currentLevel === 'gemini' && this.gemini) {
            try {
                const { result } = await this.tryGemini(() => this.gemini.generateSpecialization(context));
                return result;
            }
            catch {
                // fell through
            }
        }
        if (this.currentLevel === 'cerebras' && this.cerebras) {
            try {
                const { result } = await this.tryCerebras(() => this.cerebras.generateSpecialization(context));
                return result;
            }
            catch {
                // fell through
            }
        }
        console.warn('[LLM] All providers failed, using Mock');
        this.currentLevel = 'mock';
        return this.mock.generateSpecialization();
    }
    async generateNPCProfile(context) {
        if (this.currentLevel === 'mock')
            return this.mock.generateNPCProfile();
        if (this.currentLevel === 'gemini' && this.gemini) {
            try {
                const { result } = await this.tryGemini(() => this.gemini.generateNPCProfile(context));
                return result;
            }
            catch {
                // fell through
            }
        }
        if (this.currentLevel === 'cerebras' && this.cerebras) {
            try {
                const { result } = await this.tryCerebras(() => this.cerebras.generateNPCProfile(context));
                return result;
            }
            catch {
                // fell through
            }
        }
        console.warn('[LLM] All providers failed, using Mock');
        this.currentLevel = 'mock';
        return this.mock.generateNPCProfile();
    }
    async generateBio(context) {
        if (this.currentLevel === 'mock')
            return this.mock.generateBio();
        if (this.currentLevel === 'gemini' && this.gemini) {
            try {
                const { result } = await this.tryGemini(() => this.gemini.generateBio(context));
                return result;
            }
            catch {
                // fell through
            }
        }
        if (this.currentLevel === 'cerebras' && this.cerebras) {
            try {
                const { result } = await this.tryCerebras(() => this.cerebras.generateBio(context));
                return result;
            }
            catch {
                // fell through
            }
        }
        console.warn('[LLM] All providers failed, using Mock');
        this.currentLevel = 'mock';
        return this.mock.generateBio();
    }
}
exports.CascadeLLMProvider = CascadeLLMProvider;
//# sourceMappingURL=cascade-provider.js.map