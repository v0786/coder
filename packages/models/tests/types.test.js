"use strict";
/**
 * Model Provider Types Tests
 * Unit tests for type definitions
 */
describe('Model Provider Types', () => {
    describe('MessageRole', () => {
        it('should accept valid message roles', () => {
            const roles = ['system', 'user', 'assistant', 'tool'];
            // Type checking should pass for valid roles
            expect(roles).toContain('system');
            expect(roles).toContain('user');
            expect(roles).toContain('assistant');
            expect(roles).toContain('tool');
        });
    });
    describe('ProviderId and ModelId', () => {
        it('should accept provider identifiers', () => {
            const providerId = 'ollama';
            const qualifiedModelId = 'ollama:qwen2.5-coder:7b';
            expect(typeof providerId).toBe('string');
            expect(typeof qualifiedModelId).toBe('string');
            expect(providerId).toBe('ollama');
        });
        it('should format qualified model IDs', () => {
            const provider = 'ollama';
            const model = 'qwen2.5-coder:7b';
            const qualified = `${provider}:${model}`;
            expect(qualified).toBe('ollama:qwen2.5-coder:7b');
        });
    });
    describe('ChatMessage', () => {
        it('should create valid chat messages', () => {
            const message = {
                role: 'user',
                content: 'Hello, world!',
            };
            expect(message.role).toBe('user');
            expect(message.content).toBe('Hello, world!');
        });
        it('should support system messages', () => {
            const message = {
                role: 'system',
                content: 'You are a helpful assistant.',
            };
            expect(message.role).toBe('system');
            expect(message.content).toBe('You are a helpful assistant.');
        });
        it('should include optional name field', () => {
            const message = {
                role: 'tool',
                content: 'Result: 42',
                name: 'calculator',
            };
            expect(message.name).toBe('calculator');
        });
    });
    describe('GenerationOptions', () => {
        it('should accept valid generation options', () => {
            const options = {
                temperature: 0.7,
                maxTokens: 1024,
                topP: 0.9,
                seed: 12345,
            };
            expect(options.temperature).toBe(0.7);
            expect(options.maxTokens).toBe(1024);
            expect(options.topP).toBe(0.9);
            expect(options.seed).toBe(12345);
        });
        it('should support optional parameters', () => {
            const options = {
                temperature: 0.5,
                stopSequences: ['</answer>', 'END'],
            };
            expect(options.stopSequences).toEqual(['</answer>', 'END']);
        });
    });
    describe('ChatCompletionOptions', () => {
        it('should include stream and signal options', () => {
            const options = {
                stream: true,
                timeoutMs: 30000,
            };
            expect(options.stream).toBe(true);
            expect(options.timeoutMs).toBe(30000);
        });
    });
    describe('FinishReason', () => {
        it('should accept valid finish reasons', () => {
            const reasons = [
                'stop',
                'length',
                'content_filter',
                'tool_calls',
                'error',
                'unknown',
            ];
            expect(reasons).toContain('stop');
            expect(reasons).toContain('length');
            expect(reasons).toContain('content_filter');
            expect(reasons).toContain('tool_calls');
            expect(reasons).toContain('error');
            expect(reasons).toContain('unknown');
        });
    });
    describe('ProviderHealthStatus', () => {
        it('should accept valid health statuses', () => {
            const statuses = ['healthy', 'degraded', 'unavailable', 'unknown'];
            expect(statuses).toContain('healthy');
            expect(statuses).toContain('degraded');
            expect(statuses).toContain('unavailable');
            expect(statuses).toContain('unknown');
        });
    });
    describe('ProviderCapabilities', () => {
        it('should define provider capabilities', () => {
            const caps = {
                streaming: true,
                cancellation: true,
                multiModel: true,
                localModels: true,
                requiresAuth: false,
                features: ['chat', 'streaming', 'local_execution'],
            };
            expect(caps.streaming).toBe(true);
            expect(caps.localModels).toBe(true);
            expect(caps.requiresAuth).toBe(false);
            expect(caps.features).toContain('chat');
        });
    });
    describe('UsageMetadata', () => {
        it('should track token usage', () => {
            const usage = {
                promptTokens: 50,
                completionTokens: 150,
                totalTokens: 200,
            };
            expect(usage.promptTokens + usage.completionTokens).toBe(usage.totalTokens);
        });
    });
});
//# sourceMappingURL=types.test.js.map