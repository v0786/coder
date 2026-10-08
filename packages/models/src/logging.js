/**
 * CODER Model Provider Logging
 * Structured logging for model provider operations
 */
/** Log levels */
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (LogLevel = {}));
/**
 * Simple structured logger for providers.
 * Can be replaced with CODER's core logger.
 */
export class ProviderLogger {
    component;
    minLevel;
    constructor(component, minLevel = LogLevel.INFO) {
        this.component = component;
        this.minLevel = minLevel;
    }
    /**
     * Log provider initialization.
     */
    logInitialize(providerId, config) {
        this.info('Initializing provider', { providerId, baseUrl: config.baseUrl });
    }
    /**
     * Log successful initialization.
     */
    logInitialized(providerId, durationMs) {
        this.info('Provider initialized', { providerId, durationMs });
    }
    /**
     * Log health check.
     */
    logHealthCheck(providerId, status, durationMs, error) {
        const meta = { providerId, status, durationMs };
        if (error) {
            meta.error = error;
        }
        if (status === 'healthy') {
            this.info('Health check passed', meta);
        }
        else if (status === 'degraded') {
            this.warn('Health check degraded', meta);
        }
        else {
            this.error('Health check failed', meta);
        }
    }
    /**
     * Log model discovery (listModels, getModel).
     * Does NOT log full model lists to avoid spam.
     */
    logModelDiscovery(providerId, operation, modelId, resultCount) {
        const meta = { providerId, operation };
        if (modelId)
            meta.modelId = modelId;
        if (resultCount !== undefined)
            meta.count = resultCount;
        this.debug('Model discovery', meta);
    }
    /**
     * Log chat request start.
     * Sanitizes messages to avoid logging sensitive content.
     */
    logChatStart(providerId, modelId, options) {
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
    logChatComplete(providerId, modelId, result) {
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
    logStreamChunk(providerId, modelId, isFinal) {
        this.debug('Stream chunk', { providerId, modelId, isFinal });
    }
    /**
     * Log cancellation.
     */
    logCancel(providerId, modelId, reason) {
        this.info('Request cancelled', { providerId, modelId, reason });
    }
    /**
     * Log timeout.
     */
    logTimeout(providerId, modelId, timeoutMs) {
        this.error('Request timeout', { providerId, modelId, timeoutMs });
    }
    /**
     * Log error.
     * Does NOT include full error messages that may contain secrets.
     */
    logError(providerId, error, context) {
        const meta = {
            providerId,
            errorCode: error.code,
            retryable: error.retryable,
        };
        if (context?.modelId)
            meta.modelId = context.modelId;
        if (context?.operation)
            meta.operation = context.operation;
        if (error.httpStatus)
            meta.httpStatus = error.httpStatus;
        this.error('Provider error', meta);
    }
    /**
     * Log disposaL.
     */
    logDispose(providerId, durationMs) {
        this.logAtLevel('info', 'Provider disposed', { providerId, durationMs });
    }
    // Public logging interface (matches AbstractModelProvider requirements)
    debug(message, meta = {}) {
        this.log(LogLevel.DEBUG, message, meta);
    }
    info(message, meta = {}) {
        this.log(LogLevel.INFO, message, meta);
    }
    warn(message, meta = {}) {
        this.log(LogLevel.WARN, message, meta);
    }
    error(message, meta = {}) {
        this.log(LogLevel.ERROR, message, meta);
    }
    // --------------------------------------------------------------------------
    // Internal logging methods
    // --------------------------------------------------------------------------
    logAtLevel(_level, message, meta = {}) {
        // Implementation follows the main log method pattern
        this.log(LogLevel.INFO, message, meta);
    }
    log(level, message, meta) {
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
    shouldLog(level) {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        const currentIndex = levels.indexOf(this.minLevel);
        const levelIndex = levels.indexOf(level);
        return levelIndex >= currentIndex;
    }
}
/**
 * Create a provider logger instance.
 */
export function createProviderLogger(component, level) {
    return new ProviderLogger(component, level);
}
/**
 * Sanitize messages for logging - removes content to avoid logging prompts.
 * Only logs metadata about messages.
 */
export function sanitizeMessagesForLogging(messages) {
    return {
        count: messages.length,
        roles: messages.map((m) => m.role),
    };
}
//# sourceMappingURL=logging.js.map