"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CerebrasProvider = void 0;
const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';
const CEREBRAS_MODEL = 'gpt-oss-120b';
class CerebrasProvider {
    apiKey;
    model;
    constructor(apiKey, model = CEREBRAS_MODEL) {
        this.apiKey = apiKey;
        this.model = model;
    }
    async callLLM(prompt) {
        const response = await fetch(CEREBRAS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant. Respond with valid JSON only.' },
                    { role: 'user', content: prompt },
                ],
                max_tokens: 1024,
                temperature: 0.7,
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Cerebras API error ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        return data.choices[0].message.content;
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
    async generateQuestBranch(context) {
        const response = await this.callLLM(context);
        return this.parseJSON(response);
    }
}
exports.CerebrasProvider = CerebrasProvider;
//# sourceMappingURL=cerebras-provider.js.map