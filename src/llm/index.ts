import { LLMProvider } from './provider';
import { GeminiProvider } from './gemini-provider';
import { CerebrasProvider } from './cerebras-provider';
import { MockLLMProvider } from './mock-provider';
import { CascadeLLMProvider } from './cascade-provider';

export function createLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || 'mock';
  const geminiKey = process.env.LLM_API_KEY || '';
  const geminiModel = process.env.LLM_MODEL || 'gemini-2.0-flash';
  const cerebrasKey = process.env.CEREBRAS_API_KEY || '';
  const cerebrasModel = process.env.CEREBRAS_MODEL || 'llama3.1-8b';

  if (provider === 'gemini' && geminiKey) {
    return new CascadeLLMProvider(geminiKey, cerebrasKey || undefined);
  }

  if (provider === 'cerebras' && cerebrasKey) {
    return new CerebrasProvider(cerebrasKey, cerebrasModel);
  }

  return new MockLLMProvider();
}

export * from './provider';
export * from './gemini-provider';
export * from './cerebras-provider';
export * from './mock-provider';
export * from './cascade-provider';
