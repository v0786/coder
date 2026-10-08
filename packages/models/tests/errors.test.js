/**
 * Model Provider Error Tests
 * Unit tests for error types and handling
 */
import { ModelProviderError, ProviderUnavailableError, ModelNotFoundError, ModelNotLoadedError, RateLimitError, InvalidRequestError, AuthenticationError, TimeoutError, CancelledError, StreamError, ParseError, UnknownProviderError, isModelProviderError, isRetryableError, normalizeError, } from '../src/errors';
describe('Model Provider Errors', () => {
    describe('Base ModelProviderError', () => {
        it('should create error with all properties', () => {
            const error = new ModelProviderError('UNKNOWN_ERROR', 'Something went wrong', {
                providerId: 'ollama',
                modelId: 'qwen2.5-coder:7b',
                retryable: false,
                httpStatus: 500,
            });
            expect(error.code).toBe('UNKNOWN_ERROR');
            expect(error.message).toBe('Something went wrong');
            expect(error.providerId).toBe('ollama');
            expect(error.modelId).toBe('qwen2.5-coder:7b');
            expect(error.retryable).toBe(false);
            expect(error.httpStatus).toBe(500);
            expect(error.name).toBe('ModelProviderError');
        });
        it('should default retryable to false', () => {
            const error = new ModelProviderError('TIMEOUT', 'Timed out');
            expect(error.retryable).toBe(false);
        });
        it('should serialize to JSON', () => {
            const error = new ModelProviderError('MODEL_NOT_FOUND', 'Not found', {
                providerId: 'ollama',
                modelId: 'test',
                retryable: false,
            });
            const json = error.toJSON();
            expect(json.code).toBe('MODEL_NOT_FOUND');
            expect(json.providerId).toBe('ollama');
            expect(json.retryable).toBe(false);
        });
    });
    describe('ProviderUnavailableError', () => {
        it('should create with default retryable true', () => {
            const error = new ProviderUnavailableError('Connection refused', {
                providerId: 'ollama',
            });
            expect(error.code).toBe('PROVIDER_UNAVAILABLE');
            expect(error.retryable).toBe(true);
            expect(error.providerId).toBe('ollama');
        });
    });
    describe('ModelNotFoundError', () => {
        it('should auto-format message', () => {
            const error = new ModelNotFoundError('my-model', 'ollama');
            expect(error.code).toBe('MODEL_NOT_FOUND');
            expect(error.message).toContain('"my-model"');
            expect(error.message).toContain('"ollama"');
            expect(error.retryable).toBe(false);
        });
    });
    describe('ModelNotLoadedError', () => {
        it('should auto-format message', () => {
            const error = new ModelNotLoadedError('my-model', 'ollama');
            expect(error.code).toBe('MODEL_NOT_LOADED');
            expect(error.message).toContain('not loaded');
            expect(error.modelId).toBe('my-model');
        });
    });
    describe('RateLimitError', () => {
        it('should include retryAfterMs', () => {
            const error = new RateLimitError('Too many requests', {
                retryAfterMs: 5000,
            });
            expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
            expect(error.retryAfterMs).toBe(5000);
            expect(error.retryable).toBe(true);
        });
    });
    describe('InvalidRequestError', () => {
        it('should create error', () => {
            const error = new InvalidRequestError('Invalid prompt format', {
                providerId: 'ollama',
            });
            expect(error.code).toBe('INVALID_REQUEST');
            expect(error.retryable).toBe(false);
        });
    });
    describe('AuthenticationError', () => {
        it('should create error', () => {
            const error = new AuthenticationError('Invalid API key', {
                providerId: 'ollama',
            });
            expect(error.code).toBe('AUTHENTICATION_ERROR');
            expect(error.retryable).toBe(false);
        });
    });
    describe('TimeoutError', () => {
        it('should include timeout duration', () => {
            const error = new TimeoutError(30000, { providerId: 'ollama' });
            expect(error.code).toBe('TIMEOUT');
            expect(error.timeoutMs).toBe(30000);
            expect(error.message).toContain('30000ms');
        });
    });
    describe('CancelledError', () => {
        it('should create error', () => {
            const error = new CancelledError({ providerId: 'ollama' });
            expect(error.code).toBe('CANCELLED');
            expect(error.retryable).toBe(false);
        });
    });
    describe('StreamError', () => {
        it('should create error', () => {
            const error = new StreamError('Stream interrupted');
            expect(error.code).toBe('STREAM_ERROR');
        });
    });
    describe('ParseError', () => {
        it('should create error', () => {
            const error = new ParseError('Invalid JSON', { httpStatus: 200 });
            expect(error.code).toBe('PARSE_ERROR');
            expect(error.retryable).toBe(false);
        });
    });
    describe('UnknownProviderError', () => {
        it('should create error', () => {
            const error = new UnknownProviderError('Unexpected failure');
            expect(error.code).toBe('UNKNOWN_ERROR');
        });
    });
    describe('isModelProviderError', () => {
        it('should return true for provider errors', () => {
            const error = new ProviderUnavailableError('test');
            expect(isModelProviderError(error)).toBe(true);
        });
        it('should return false for regular errors', () => {
            expect(isModelProviderError(new Error('test'))).toBe(false);
        });
        it('should return false for non-errors', () => {
            expect(isModelProviderError('not an error')).toBe(false);
            expect(isModelProviderError(null)).toBe(false);
            expect(isModelProviderError(undefined)).toBe(false);
        });
    });
    describe('isRetryableError', () => {
        it('should return true for retryable errors', () => {
            const error = new ProviderUnavailableError('test');
            expect(isRetryableError(error)).toBe(true);
        });
        it('should return false for non-retryable errors', () => {
            const error = new InvalidRequestError('test');
            expect(isRetryableError(error)).toBe(false);
        });
        it('should return false for non-provider errors', () => {
            expect(isRetryableError(new Error('test'))).toBe(false);
        });
    });
    describe('normalizeError', () => {
        it('should pass through ModelProviderError', () => {
            const original = new ProviderUnavailableError('test');
            const normalized = normalizeError(original);
            expect(normalized).toBe(original);
        });
        it('should detect cancelled errors', () => {
            const error = new Error('Request was aborted');
            error.name = 'AbortError';
            const normalized = normalizeError(error, 'ollama');
            expect(normalized.code).toBe('CANCELLED');
            expect(normalized.providerId).toBe('ollama');
        });
        it('should detect timeout errors', () => {
            const error = new Error('Request timeout');
            error.name = 'TimeoutError';
            const normalized = normalizeError(error, 'ollama');
            expect(normalized.code).toBe('TIMEOUT');
            expect(normalized).toBeInstanceOf(TimeoutError);
        });
        it('should detect not found errors', () => {
            const error = new Error('Model not found');
            const normalized = normalizeError(error, 'ollama', 'my-model');
            expect(normalized.code).toBe('MODEL_NOT_FOUND');
            expect(normalized.modelId).toBe('my-model');
        });
        it('should wrap unknown errors', () => {
            const error = new Error('Something unexpected');
            const normalized = normalizeError(error, 'ollama');
            expect(normalized.code).toBe('UNKNOWN_ERROR');
            expect(normalized.cause).toBe(error);
        });
        it('should handle non-error values', () => {
            const normalized = normalizeError('just a string', 'ollama');
            expect(normalized.code).toBe('UNKNOWN_ERROR');
            expect(normalized.message).toBe('just a string');
        });
    });
    describe('Error inheritance', () => {
        it('should maintain instanceof relationships', () => {
            const errors = [
                new ProviderUnavailableError('test'),
                new ModelNotFoundError('m', 'p'),
                new TimeoutError(1000),
                new CancelledError(),
            ];
            errors.forEach((error) => {
                expect(error).toBeInstanceOf(ModelProviderError);
                expect(error).toBeInstanceOf(Error);
            });
        });
        it('should capture stack traces', () => {
            const error = new ProviderUnavailableError('test');
            expect(error.stack).toBeDefined();
            expect(error.stack).toContain('ProviderUnavailableError');
        });
    });
});
//# sourceMappingURL=errors.test.js.map