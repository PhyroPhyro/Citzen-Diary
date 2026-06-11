import { LLMProvider } from './provider';
import { GeminiProvider } from './gemini-provider';
import { MockLLMProvider } from './mock-provider';

export function createLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || 'mock';
  const apiKey = process.env.LLM_API_KEY || '';
  const model = process.env.LLM_MODEL || 'gemini-2.0-flash';

  if (provider === 'gemini' && apiKey) {
    return new GeminiProvider(apiKey, model);
  }

  return new MockLLMProvider();
}

export * from './provider';
export * from './gemini-provider';
export * from './mock-provider';
