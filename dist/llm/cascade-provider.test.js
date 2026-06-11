"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const cascade_provider_1 = require("./cascade-provider");
(0, vitest_1.describe)('CascadeLLMProvider', () => {
    let provider;
    (0, vitest_1.beforeEach)(() => {
        provider = new cascade_provider_1.CascadeLLMProvider('fake-gemini-key');
    });
    (0, vitest_1.describe)('resetToGemini', () => {
        (0, vitest_1.it)('does nothing if already on gemini', () => {
            (0, vitest_1.expect)(provider.activeProvider).toBe('gemini');
            provider.resetToGemini();
            (0, vitest_1.expect)(provider.activeProvider).toBe('gemini');
        });
        (0, vitest_1.it)('does not reset if failure was recent', () => {
            provider['currentLevel'] = 'cerebras';
            provider['lastGeminiFailure'] = Date.now();
            provider.resetToGemini();
            (0, vitest_1.expect)(provider.activeProvider).toBe('cerebras');
        });
        (0, vitest_1.it)('resets to gemini if cooldown has passed', () => {
            provider['currentLevel'] = 'cerebras';
            provider['lastGeminiFailure'] = Date.now() - 2 * 60 * 60 * 1000;
            provider.resetToGemini();
            (0, vitest_1.expect)(provider.activeProvider).toBe('gemini');
        });
        (0, vitest_1.it)('does not reset if gemini is not configured', () => {
            const noGemini = new cascade_provider_1.CascadeLLMProvider(undefined, 'fake-cerebras-key');
            noGemini['currentLevel'] = 'cerebras';
            noGemini['lastGeminiFailure'] = Date.now() - 2 * 60 * 60 * 1000;
            noGemini.resetToGemini();
            (0, vitest_1.expect)(noGemini.activeProvider).toBe('cerebras');
        });
    });
    (0, vitest_1.describe)('activeProvider', () => {
        (0, vitest_1.it)('starts as gemini', () => {
            (0, vitest_1.expect)(provider.activeProvider).toBe('gemini');
        });
    });
});
//# sourceMappingURL=cascade-provider.test.js.map