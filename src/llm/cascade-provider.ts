import {
  LLMProvider,
  LLMResponse,
  MilestoneLLMResponse,
  SpecializationLLMResponse,
  NPCProfileLLMResponse,
  BioLLMResponse,
} from './provider';
import { GeminiProvider } from './gemini-provider';
import { CerebrasProvider } from './cerebras-provider';
import { MockLLMProvider } from './mock-provider';

export class CascadeLLMProvider implements LLMProvider {
  private gemini: GeminiProvider | null = null;
  private cerebras: CerebrasProvider | null = null;
  private mock: MockLLMProvider;
  private currentLevel: 'gemini' | 'cerebras' | 'mock' = 'gemini';

  constructor(geminiApiKey?: string, cerebrasApiKey?: string) {
    this.mock = new MockLLMProvider();
    if (geminiApiKey) {
      this.gemini = new GeminiProvider(geminiApiKey);
    }
    if (cerebrasApiKey) {
      this.cerebras = new CerebrasProvider(cerebrasApiKey);
    }
  }

  get activeProvider(): string {
    return this.currentLevel;
  }

  private isQuotaError(error: unknown): boolean {
    const msg = String(error);
    return msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests') || msg.includes('rate limit');
  }

  private async tryGemini<T>(fn: () => Promise<T>): Promise<{ result: T; provider: string }> {
    if (!this.gemini) throw new Error('Gemini not configured');
    try {
      const result = await fn();
      return { result, provider: 'gemini' };
    } catch (error) {
      if (this.isQuotaError(error)) {
        console.warn('[LLM] Gemini quota exceeded, trying Cerebras...');
        this.currentLevel = 'cerebras';
        throw error;
      }
      throw error;
    }
  }

  private async tryCerebras<T>(fn: () => Promise<T>): Promise<{ result: T; provider: string }> {
    if (!this.cerebras) throw new Error('Cerebras not configured');
    try {
      const result = await fn();
      return { result, provider: 'cerebras' };
    } catch (error) {
      if (this.isQuotaError(error)) {
        console.warn('[LLM] Cerebras quota exceeded, falling back to Mock...');
        this.currentLevel = 'mock';
        throw error;
      }
      throw error;
    }
  }

  async generateDiaryEntry(context: string): Promise<LLMResponse> {
    if (this.currentLevel === 'mock') return this.mock.generateDiaryEntry();

    if (this.currentLevel === 'gemini' && this.gemini) {
      try {
        const { result } = await this.tryGemini(() => this.gemini!.generateDiaryEntry(context));
        return result;
      } catch {
        // fell through to cerebras or mock
      }
    }

    if (this.currentLevel === 'cerebras' && this.cerebras) {
      try {
        const { result } = await this.tryCerebras(() => this.cerebras!.generateDiaryEntry(context));
        return result;
      } catch {
        // fell through to mock
      }
    }

    console.warn('[LLM] All providers failed, using Mock');
    this.currentLevel = 'mock';
    return this.mock.generateDiaryEntry();
  }

  async generateMilestone(context: string): Promise<MilestoneLLMResponse> {
    if (this.currentLevel === 'mock') return this.mock.generateMilestone();

    if (this.currentLevel === 'gemini' && this.gemini) {
      try {
        const { result } = await this.tryGemini(() => this.gemini!.generateMilestone(context));
        return result;
      } catch {
        // fell through
      }
    }

    if (this.currentLevel === 'cerebras' && this.cerebras) {
      try {
        const { result } = await this.tryCerebras(() => this.cerebras!.generateMilestone(context));
        return result;
      } catch {
        // fell through
      }
    }

    console.warn('[LLM] All providers failed, using Mock');
    this.currentLevel = 'mock';
    return this.mock.generateMilestone();
  }

  async generateSpecialization(context: string): Promise<SpecializationLLMResponse> {
    if (this.currentLevel === 'mock') return this.mock.generateSpecialization();

    if (this.currentLevel === 'gemini' && this.gemini) {
      try {
        const { result } = await this.tryGemini(() => this.gemini!.generateSpecialization(context));
        return result;
      } catch {
        // fell through
      }
    }

    if (this.currentLevel === 'cerebras' && this.cerebras) {
      try {
        const { result } = await this.tryCerebras(() => this.cerebras!.generateSpecialization(context));
        return result;
      } catch {
        // fell through
      }
    }

    console.warn('[LLM] All providers failed, using Mock');
    this.currentLevel = 'mock';
    return this.mock.generateSpecialization();
  }

  async generateNPCProfile(context: string): Promise<NPCProfileLLMResponse> {
    if (this.currentLevel === 'mock') return this.mock.generateNPCProfile();

    if (this.currentLevel === 'gemini' && this.gemini) {
      try {
        const { result } = await this.tryGemini(() => this.gemini!.generateNPCProfile(context));
        return result;
      } catch {
        // fell through
      }
    }

    if (this.currentLevel === 'cerebras' && this.cerebras) {
      try {
        const { result } = await this.tryCerebras(() => this.cerebras!.generateNPCProfile(context));
        return result;
      } catch {
        // fell through
      }
    }

    console.warn('[LLM] All providers failed, using Mock');
    this.currentLevel = 'mock';
    return this.mock.generateNPCProfile();
  }

  async generateBio(context: string): Promise<BioLLMResponse> {
    if (this.currentLevel === 'mock') return this.mock.generateBio();

    if (this.currentLevel === 'gemini' && this.gemini) {
      try {
        const { result } = await this.tryGemini(() => this.gemini!.generateBio(context));
        return result;
      } catch {
        // fell through
      }
    }

    if (this.currentLevel === 'cerebras' && this.cerebras) {
      try {
        const { result } = await this.tryCerebras(() => this.cerebras!.generateBio(context));
        return result;
      } catch {
        // fell through
      }
    }

    console.warn('[LLM] All providers failed, using Mock');
    this.currentLevel = 'mock';
    return this.mock.generateBio();
  }
}
