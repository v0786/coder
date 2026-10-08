/**
 * CODER Model Provider Errors
 * Error types specific to the Model Provider Layer
 */
/** Base class for all model provider errors */
export class ModelProviderError extends Error {
    code;
    providerId;
    modelId;
    retryable;
    cause;
    httpStatus;
    providerCode;
    constructor(code, message, options = {}) {
        super(message);
        this.name = 'ModelProviderError';
        this.code = code;
        this.providerId = options.providerId;
        this.modelId = options.modelId;
        this.retryable = options.retryable ?? false;
        this.cause = options.cause;
        this.httpStatus = options.httpStatus;
        this.providerCode = options.providerCode;
        // Maintain proper prototype chain
        Object.setPrototypeOf(this, ModelProviderError.prototype);
    }
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            providerId: this.providerId,
            modelId: this.modelId,
            retryable: this.retryable,
            httpStatus: this.httpStatus,
            providerCode: this.providerCode,
        };
    }
}
/** Provider is unavailable (connection refused, timeout, etc.) */
export class ProviderUnavailableError extends ModelProviderError {
    httpStatus;
    constructor(message, options = {}) {
        super('PROVIDER_UNAVAILABLE', message, { ...options, retryable: options.retryable ?? true });
        this.httpStatus = options.httpStatus;
        Object.setPrototypeOf(this, ProviderUnavailableError.prototype);
    }
}
/** Model not found in provider */
export class ModelNotFoundError extends ModelProviderError {
    constructor(modelId, providerId, options = {}) {
        super('MODEL_NOT_FOUND', `Model "${modelId}" not found in provider "${providerId}"`, {
            providerId,
            modelId,
            ...options,
            retryable: false,
        });
        Object.setPrototypeOf(this, ModelNotFoundError.prototype);
    }
}
/** Model found but not loaded/running */
export class ModelNotLoadedError extends ModelProviderError {
    constructor(modelId, providerId, options = {}) {
        super('MODEL_NOT_LOADED', `Model "${modelId}" is not loaded in provider "${providerId}". The model may need to be pulled or started.`, {
            providerId,
            modelId,
            ...options,
            retryable: false,
        });
        Object.setPrototypeOf(this, ModelNotLoadedError.prototype);
    }
}
/** Rate limit exceeded */
export class RateLimitError extends ModelProviderError {
    retryAfterMs;
    constructor(message, options = {}) {
        super('RATE_LIMIT_EXCEEDED', message, {
            ...options,
            providerId: options.providerId,
            retryable: true,
        });
        this.retryAfterMs = options.retryAfterMs;
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}
/** Invalid request (malformed messages, bad parameters, etc.) */
export class InvalidRequestError extends ModelProviderError {
    constructor(message, options = {}) {
        super('INVALID_REQUEST', message, {
            ...options,
            retryable: false,
        });
        Object.setPrototypeOf(this, InvalidRequestError.prototype);
    }
}
/** Authentication error (bad API key, etc.) */
export class AuthenticationError extends ModelProviderError {
    constructor(message, options = {}) {
        super('AUTHENTICATION_ERROR', message, {
            ...options,
            retryable: false,
        });
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
/** Request timeout */
export class TimeoutError extends ModelProviderError {
    timeoutMs;
    constructor(timeoutMs, options = {}) {
        super('TIMEOUT', `Request timed out after ${timeoutMs}ms`, {
            ...options,
            retryable: true,
        });
        this.timeoutMs = timeoutMs;
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}
/** Request was cancelled (via AbortSignal) */
export class CancelledError extends ModelProviderError {
    constructor(options = {}) {
        super('CANCELLED', 'Request was cancelled', {
            ...options,
            retryable: false,
        });
        Object.setPrototypeOf(this, CancelledError.prototype);
    }
}
/** Error during streaming */
export class StreamError extends ModelProviderError {
    constructor(message, options = {}) {
        super('STREAM_ERROR', message, options);
        Object.setPrototypeOf(this, StreamError.prototype);
    }
}
/** Error parsing response from provider */
export class ParseError extends ModelProviderError {
    constructor(message, options = {}) {
        super('PARSE_ERROR', message, {
            ...options,
            retryable: false,
        });
        Object.setPrototypeOf(this, ParseError.prototype);
    }
}
/** Unknown/unexpected error */
export class UnknownProviderError extends ModelProviderError {
    constructor(message, options = {}) {
        super('UNKNOWN_ERROR', message, { ...options, retryable: false });
        Object.setPrototypeOf(this, UnknownProviderError.prototype);
    }
}
/** Utility function to check if an error is a ModelProviderError */
export function isModelProviderError(error) {
    return error instanceof ModelProviderError;
}
/** Utility function to check if an error is retryable */
export function isRetryableError(error) {
    if (error instanceof ModelProviderError) {
        return error.retryable;
    }
    return false;
}
/**
 * Normalize an error into a ModelProviderError.
 * This is useful when catching unknown errors and converting them.
 */
export function normalizeError(error, providerId, modelId) {
    if (error instanceof ModelProviderError) {
        return error;
    }
    if (error instanceof Error) {
        // Check for common error patterns
        const message = error.message.toLowerCase();
        if (message.includes('abort') || message.includes('cancel') || error.name === 'AbortError') {
            return new CancelledError({ providerId, modelId, cause: error });
        }
        if (message.includes('timeout') || error.name === 'TimeoutError') {
            return new TimeoutError(30000, { providerId, modelId, cause: error });
        }
        if (message.includes('not found') || message.includes('not exist')) {
            return new ModelNotFoundError(modelId || 'unknown', providerId || 'unknown', {
                cause: error,
            });
        }
        return new UnknownProviderError(error.message, { providerId, modelId, cause: error });
    }
    return new UnknownProviderError(String(error), { providerId, modelId });
}
//# sourceMappingURL=errors.js.map