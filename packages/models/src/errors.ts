/**
 * CODER Model Provider Errors
 * Error types specific to the Model Provider Layer
 */

import { ProviderErrorCode } from './types';

/** Base class for all model provider errors */
export class ModelProviderError extends Error {
  public readonly code: ProviderErrorCode;
  public readonly providerId?: string;
  public readonly modelId?: string;
  public readonly retryable: boolean;
  public readonly cause?: Error;
  public readonly httpStatus?: number;
  public readonly providerCode?: string;

  constructor(
    code: ProviderErrorCode,
    message: string,
    options: {
      providerId?: string;
      modelId?: string;
      retryable?: boolean;
      cause?: Error;
      httpStatus?: number;
      providerCode?: string;
    } = {}
  ) {
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

  toJSON(): Record<string, unknown> {
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
  public readonly httpStatus?: number;

  constructor(
    message: string,
    options: {
      providerId?: string;
      cause?: Error;
      retryable?: boolean;
      httpStatus?: number;
    } = {}
  ) {
    super('PROVIDER_UNAVAILABLE', message, { ...options, retryable: options.retryable ?? true });
    this.httpStatus = options.httpStatus;
    Object.setPrototypeOf(this, ProviderUnavailableError.prototype);
  }
}

/** Model not found in provider */
export class ModelNotFoundError extends ModelProviderError {
  constructor(modelId: string, providerId: string, options: { cause?: Error } = {}) {
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
  constructor(modelId: string, providerId: string, options: { cause?: Error } = {}) {
    super(
      'MODEL_NOT_LOADED',
      `Model "${modelId}" is not loaded in provider "${providerId}". The model may need to be pulled or started.`,
      {
        providerId,
        modelId,
        ...options,
        retryable: false,
      }
    );
    Object.setPrototypeOf(this, ModelNotLoadedError.prototype);
  }
}

/** Rate limit exceeded */
export class RateLimitError extends ModelProviderError {
  public readonly retryAfterMs?: number;

  constructor(
    message: string,
    options: {
      providerId?: string;
      retryAfterMs?: number;
      cause?: Error;
    } = {}
  ) {
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
  constructor(
    message: string,
    options: {
      providerId?: string;
      modelId?: string;
      cause?: Error;
    } = {}
  ) {
    super('INVALID_REQUEST', message, {
      ...options,
      retryable: false,
    });
    Object.setPrototypeOf(this, InvalidRequestError.prototype);
  }
}

/** Authentication error (bad API key, etc.) */
export class AuthenticationError extends ModelProviderError {
  constructor(
    message: string,
    options: {
      providerId?: string;
      cause?: Error;
    } = {}
  ) {
    super('AUTHENTICATION_ERROR', message, {
      ...options,
      retryable: false,
    });
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/** Request timeout */
export class TimeoutError extends ModelProviderError {
  public readonly timeoutMs: number;

  constructor(
    timeoutMs: number,
    options: {
      providerId?: string;
      modelId?: string;
      cause?: Error;
    } = {}
  ) {
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
  constructor(
    options: {
      providerId?: string;
      modelId?: string;
      cause?: Error;
    } = {}
  ) {
    super('CANCELLED', 'Request was cancelled', {
      ...options,
      retryable: false,
    });
    Object.setPrototypeOf(this, CancelledError.prototype);
  }
}

/** Error during streaming */
export class StreamError extends ModelProviderError {
  constructor(
    message: string,
    options: {
      providerId?: string;
      modelId?: string;
      cause?: Error;
      retryable?: boolean;
    } = {}
  ) {
    super('STREAM_ERROR', message, options);
    Object.setPrototypeOf(this, StreamError.prototype);
  }
}

/** Error parsing response from provider */
export class ParseError extends ModelProviderError {
  constructor(
    message: string,
    options: {
      providerId?: string;
      cause?: Error;
      httpStatus?: number;
    } = {}
  ) {
    super('PARSE_ERROR', message, {
      ...options,
      retryable: false,
    });
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

/** Unknown/unexpected error */
export class UnknownProviderError extends ModelProviderError {
  constructor(
    message: string,
    options: {
      providerId?: string;
      modelId?: string;
      cause?: Error;
    } = {}
  ) {
    super('UNKNOWN_ERROR', message, { ...options, retryable: false });
    Object.setPrototypeOf(this, UnknownProviderError.prototype);
  }
}

/** Utility function to check if an error is a ModelProviderError */
export function isModelProviderError(error: unknown): error is ModelProviderError {
  return error instanceof ModelProviderError;
}

/** Utility function to check if an error is retryable */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ModelProviderError) {
    return error.retryable;
  }
  return false;
}

/**
 * Normalize an error into a ModelProviderError.
 * This is useful when catching unknown errors and converting them.
 */
export function normalizeError(
  error: unknown,
  providerId?: string,
  modelId?: string
): ModelProviderError {
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
