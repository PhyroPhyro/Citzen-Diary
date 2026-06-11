import {
  LLMProvider,
  LLMResponse,
  MilestoneLLMResponse,
  SpecializationLLMResponse,
  NPCProfileLLMResponse,
  BioLLMResponse,
} from './provider';
import { GeminiProvider } from './gemini-provider';
import { MockLLMProvider } from './mock-provider';

export class FallbackLLMProvider implements LLMProvider {
  private primary: GeminiProvider;
  private fallback: MockLLMProvider;
  private useFallback = false;

  constructor(apiKey: string, model: string) {
    this.primary = new GeminiProvider(apiKey, model);
    this.fallback = new MockLLMProvider();
  }

  private isQuotaError(error: unknown): boolean {
    const msg = String(error);
    return msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests');
  }

  async generateDiaryEntry(_context: string): Promise<LLMResponse> {
    if (this.useFallback) return this.fallback.generateDiaryEntry();
    try {
      return await this.primary.generateDiaryEntry(_context);
    } catch (error) {
      if (this.isQuotaError(error)) {
        console.warn('[LLM] Gemini quota exceeded, falling back to Mock provider');
        this.useFallback = true;
        return this.fallback.generateDiaryEntry();
      }
      throw error;
    }
  }

  async generateMilestone(_context: string): Promise<MilestoneLLMResponse> {
    if (this.useFallback) return this.fallback.generateMilestone();
    try {
      return await this.primary.generateMilestone(_context);
    } catch (error) {
      if (this.isQuotaError(error)) {
        console.warn('[LLM] Gemini quota exceeded, falling back to Mock provider');
        this.useFallback = true;
        return this.fallback.generateMilestone();
      }
      throw error;
    }
  }

  async generateSpecialization(_context: string): Promise<SpecializationLLMResponse> {
    if (this.useFallback) return this.fallback.generateSpecialization();
    try {
      return await this.primary.generateSpecialization(_context);
    } catch (error) {
      if (this.isQuotaError(error)) {
        console.warn('[LLM] Gemini quota exceeded, falling back to Mock provider');
        this.useFallback = true;
        return this.fallback.generateSpecialization();
      }
      throw error;
    }
  }

  async generateNPCProfile(_context: string): Promise<NPCProfileLLMResponse> {
    if (this.useFallback) return this.fallback.generateNPCProfile();
    try {
      return await this.primary.generateNPCProfile(_context);
    } catch (error) {
      if (this.isQuotaError(error)) {
        console.warn('[LLM] Gemini quota exceeded, falling back to Mock provider');
        this.useFallback = true;
        return this.fallback.generateNPCProfile();
      }
      throw error;
    }
  }

  async generateBio(_context: string): Promise<BioLLMResponse> {
    if (this.useFallback) return this.fallback.generateBio();
    try {
      return await this.primary.generateBio(_context);
    } catch (error) {
      if (this.isQuotaError(error)) {
        console.warn('[LLM] Gemini quota exceeded, falling back to Mock provider');
        this.useFallback = true;
        return this.fallback.generateBio();
      }
      throw error;
    }
  }
}
