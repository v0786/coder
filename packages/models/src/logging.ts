/**
 * CODER Model Provider Logging
 * Structured logging for model provider operations
 */

import type { ProviderId, ModelId, ChatMessage } from './types';

/**
 * Log context for provider operations.
 * Contains sanitized metadata that can be logged without exposing secrets.
 */
export interface ProviderLogContext {
  providerId: ProviderId;
  modelId?: ModelId;
  requestId?: string;
  operation: ProviderOperation;
}

/** Type of provider operation being logged */
export type ProviderOperation =
  | 'initialize'
  | 'health_check'
  | 'list_models'
  | 'get_model'
  | 'chat'
  | 'stream_chat'
  | 'dispose'
  | 'error'
  | 'timeout'
  | 'cancel';

/** Log levels */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Simple structured logger for providers.
 * Can be replaced with CODER's core logger.
 */
export class ProviderLogger {
  private component: string;
  private minLevel: LogLevel;

  constructor(component: string, minLevel: LogLevel = LogLevel.INFO) {
    this.component = component;
    this.minLevel = minLevel;
  }

  /**
   * Log provider initialization.
   */
  logInitialize(providerId: ProviderId, config: { baseUrl: string; timeoutMs: number }): void {
    this.info('Initializing provider', { providerId, baseUrl: config.baseUrl });
  }

  /**
   * Log successful initialization.
   */
  logInitialized(providerId: ProviderId, durationMs: number): void {
    this.info('Provider initialized', { providerId, durationMs });
  }

  /**
   * Log health check.
   */
  logHealthCheck(providerId: ProviderId, status: string, durationMs: number, error?: string): void {
    const meta: Record<string, unknown> = { providerId, status, durationMs };
    if (error) {
      meta.error = error;
    }

    if (status === 'healthy') {
      this.info('Health check passed', meta);
    } else if (status === 'degraded') {
      this.warn('Health check degraded', meta);
    } else {
      this.error('Health check failed', meta);
    }
  }

  /**
   * Log model discovery (listModels, getModel).
   * Does NOT log full model lists to avoid spam.
   */
  logModelDiscovery(
    providerId: ProviderId,
    operation: 'list' | 'get',
    modelId?: string,
    resultCount?: number
  ): void {
    const meta: Record<string, unknown> = { providerId, operation };
    if (modelId) meta.modelId = modelId;
    if (resultCount !== undefined) meta.count = resultCount;

    this.debug('Model discovery', meta);
  }

  /**
   * Log chat request start.
   * Sanitizes messages to avoid logging sensitive content.
   */
  logChatStart(
    providerId: ProviderId,
    modelId: ModelId,
    options: { stream: boolean; messageCount: number; maxTokens?: number; temperature?: number }
  ): void {
    this.info('Chat request', {
      providerId,
      modelId,
      stream: options.stream,
      messageCount: options.messageCount,
      // Only log minimal option values, not full prompts
      hasMaxTokens: options.maxTokens !== undefined,
      hasTemperature: options.temperature !== undefined,
    });
  }

  /**
   * Log chat completion.
   */
  logChatComplete(
    providerId: ProviderId,
    modelId: ModelId,
    result: { durationMs: number; tokenCount: number; finishReason: string }
  ): void {
    this.info('Chat complete', {
      providerId,
      modelId,
      durationMs: result.durationMs,
      tokenCount: result.tokenCount,
      finishReason: result.finishReason,
    });
  }

  /**
   * Log streaming chunk (throttled in practice).
   */
  logStreamChunk(providerId: ProviderId, modelId: ModelId, isFinal: boolean): void {
    this.debug('Stream chunk', { providerId, modelId, isFinal });
  }

  /**
   * Log cancellation.
   */
  logCancel(providerId: ProviderId, modelId: ModelId, reason?: string): void {
    this.info('Request cancelled', { providerId, modelId, reason });
  }

  /**
   * Log timeout.
   */
  logTimeout(providerId: ProviderId, modelId: ModelId | undefined, timeoutMs: number): void {
    this.error('Request timeout', { providerId, modelId, timeoutMs });
  }

  /**
   * Log error.
   * Does NOT include full error messages that may contain secrets.
   */
  logError(
    providerId: ProviderId,
    error: { code: string; retryable: boolean; httpStatus?: number },
    context?: { operation: string; modelId?: ModelId }
  ): void {
    const meta: Record<string, unknown> = {
      providerId,
      errorCode: error.code,
      retryable: error.retryable,
    };

    if (context?.modelId) meta.modelId = context.modelId;
    if (context?.operation) meta.operation = context.operation;
    if (error.httpStatus) meta.httpStatus = error.httpStatus;

    this.error('Provider error', meta);
  }

  /**
   * Log disposaL.
   */
  logDispose(providerId: ProviderId, durationMs?: number): void {
    this.logAtLevel('info', 'Provider disposed', { providerId, durationMs });
  }

  // Public logging interface (matches AbstractModelProvider requirements)
  debug(message: string, meta: Record<string, unknown> = {}): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta: Record<string, unknown> = {}): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, meta: Record<string, unknown> = {}): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  // --------------------------------------------------------------------------
  // Internal logging methods
  // --------------------------------------------------------------------------

  private logAtLevel(
    _level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    meta: Record<string, unknown> = {}
  ): void {
    // Implementation follows the main log method pattern
    this.log(LogLevel.INFO, message, meta);
  }

  private log(level: LogLevel, message: string, meta: Record<string, unknown>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formattedMeta = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';

    const output = `[${timestamp}] [${this.component}:${level}] ${message}${formattedMeta}`;

    switch (level) {
      case LogLevel.DEBUG:
        // eslint-disable-next-line no-console
        console.debug(output);
        break;
      case LogLevel.INFO:
        // eslint-disable-next-line no-console
        console.info(output);
        break;
      case LogLevel.WARN:
        // eslint-disable-next-line no-console
        console.warn(output);
        break;
      case LogLevel.ERROR:
        // eslint-disable-next-line no-console
        console.error(output);
        break;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentIndex = levels.indexOf(this.minLevel);
    const levelIndex = levels.indexOf(level);
    return levelIndex >= currentIndex;
  }
}

/**
 * Create a provider logger instance.
 */
export function createProviderLogger(component: string, level?: LogLevel): ProviderLogger {
  return new ProviderLogger(component, level);
}

/**
 * Sanitize messages for logging - removes content to avoid logging prompts.
 * Only logs metadata about messages.
 */
export function sanitizeMessagesForLogging(messages: ChatMessage[]): {
  count: number;
  roles: string[];
} {
  return {
    count: messages.length,
    roles: messages.map((m) => m.role),
  };
}
