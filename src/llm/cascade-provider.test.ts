import { describe, it, expect, beforeEach } from 'vitest';
import { CascadeLLMProvider } from './cascade-provider';

describe('CascadeLLMProvider', () => {
  let provider: CascadeLLMProvider;

  beforeEach(() => {
    provider = new CascadeLLMProvider('fake-gemini-key');
  });

  describe('resetToGemini', () => {
    it('does nothing if already on gemini', () => {
      expect(provider.activeProvider).toBe('gemini');
      provider.resetToGemini();
      expect(provider.activeProvider).toBe('gemini');
    });

    it('does not reset if failure was recent', () => {
      provider['currentLevel'] = 'cerebras';
      provider['lastGeminiFailure'] = Date.now();
      provider.resetToGemini();
      expect(provider.activeProvider).toBe('cerebras');
    });

    it('resets to gemini if cooldown has passed', () => {
      provider['currentLevel'] = 'cerebras';
      provider['lastGeminiFailure'] = Date.now() - 2 * 60 * 60 * 1000;
      provider.resetToGemini();
      expect(provider.activeProvider).toBe('gemini');
    });

    it('does not reset if gemini is not configured', () => {
      const noGemini = new CascadeLLMProvider(undefined, 'fake-cerebras-key');
      noGemini['currentLevel'] = 'cerebras';
      noGemini['lastGeminiFailure'] = Date.now() - 2 * 60 * 60 * 1000;
      noGemini.resetToGemini();
      expect(noGemini.activeProvider).toBe('cerebras');
    });
  });

  describe('activeProvider', () => {
    it('starts as gemini', () => {
      expect(provider.activeProvider).toBe('gemini');
    });
  });
});
