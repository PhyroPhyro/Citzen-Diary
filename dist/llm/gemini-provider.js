"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const generative_ai_1 = require("@google/generative-ai");
class GeminiProvider {
    genAI;
    model;
    constructor(apiKey, model = 'gemini-2.0-flash') {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = model;
    }
    async callLLM(prompt) {
        const genModel = this.genAI.getGenerativeModel({ model: this.model });
        const result = await genModel.generateContent(prompt);
        const text = result.response.text();
        return text;
    }
    parseJSON(text) {
        const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        return JSON.parse(cleaned);
    }
    async generateDiaryEntry(context) {
        const response = await this.callLLM(context);
        return this.parseJSON(response);
    }
    async generateMilestone(context) {
        const response = await this.callLLM(context);
        return this.parseJSON(response);
    }
    async generateSpecialization(context) {
        const response = await this.callLLM(context);
        return this.parseJSON(response);
    }
    async generateNPCProfile(context) {
        const response = await this.callLLM(context);
        return this.parseJSON(response);
    }
    async generateBio(context) {
        const response = await this.callLLM(context);
        return this.parseJSON(response);
    }
}
exports.GeminiProvider = GeminiProvider;
//# sourceMappingURL=gemini-provider.js.map