import {
  LLMProvider,
  LLMResponse,
  MilestoneLLMResponse,
  SpecializationLLMResponse,
  NPCProfileLLMResponse,
  BioLLMResponse,
} from './provider';

const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';
const CEREBRAS_MODEL = 'gpt-oss-120b';

export class CerebrasProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = CEREBRAS_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async callLLM(prompt: string): Promise<string> {
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

    const data = await response.json() as { choices: [{ message: { content: string } }] };
    return data.choices[0].message.content;
  }

  private parseJSON<T>(text: string): T {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned) as T;
  }

  async generateDiaryEntry(context: string): Promise<LLMResponse> {
    const response = await this.callLLM(context);
    return this.parseJSON<LLMResponse>(response);
  }

  async generateMilestone(context: string): Promise<MilestoneLLMResponse> {
    const response = await this.callLLM(context);
    return this.parseJSON<MilestoneLLMResponse>(response);
  }

  async generateSpecialization(context: string): Promise<SpecializationLLMResponse> {
    const response = await this.callLLM(context);
    return this.parseJSON<SpecializationLLMResponse>(response);
  }

  async generateNPCProfile(context: string): Promise<NPCProfileLLMResponse> {
    const response = await this.callLLM(context);
    return this.parseJSON<NPCProfileLLMResponse>(response);
  }

  async generateBio(context: string): Promise<BioLLMResponse> {
    const response = await this.callLLM(context);
    return this.parseJSON<BioLLMResponse>(response);
  }
}
