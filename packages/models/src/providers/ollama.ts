/**
 * CODER Ollama Provider
 * Implementation of the ModelProvider interface for local Ollama
 */

import type {
  ProviderId,
  ModelId,
  ProviderConfig,
  ProviderCapabilities,
  ProviderHealth,
  ModelInfo,
  ChatMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  ChatCompletionChunk,
  MessageRole,
  FinishReason,
  UsageMetadata,
} from '../types';
import { AbstractModelProvider } from '../provider';
import {
  ProviderUnavailableError,
  ModelNotFoundError,
  ModelNotLoadedError,
  TimeoutError,
  CancelledError,
  ParseError,
  InvalidRequestError,
  normalizeError,
} from '../errors';
import { ProviderLogger, LogLevel } from '../logging';

// ============================================================================
// Ollama API Types
// ============================================================================

/** Ollama API response structure for tags endpoint */
interface OllamaTagsResponse {
  models: Array<{
    name: string;
    model?: string;
    size?: number;
    digest?: string;
    details?: {
      parameter_size?: string;
      families?: string[];
    };
    modified_at?: string;
  }>;
}

/** Ollama API request for chat */
interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
    top_p?: number;
    top_k?: number;
    seed?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    stop?: string[];
  };
}

/** Ollama message format */
interface OllamaMessage {
  role: OllamaRole;
  content: string;
}

type OllamaRole = 'system' | 'user' | 'assistant';

/** Ollama API response for chat */
interface OllamaChatResponse {
  model: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/** Ollama API streaming chunk */
interface OllamaStreamChunk {
  model: string;
  message: {
    role: OllamaRole;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/** Ollama error response */
interface OllamaErrorResponse {
  error: string;
}

// ============================================================================
// Ollama Provider
// ============================================================================

/** Ollama provider capabilities */
export const OLLAMA_CAPABILITIES: ProviderCapabilities = {
  streaming: true,
  cancellation: true,
  multiModel: true,
  localModels: true,
  requiresAuth: false,
  features: ['chat', 'streaming', 'local_execution'],
};

/**
 * Ollama provider implementation.
 *
 * Connects to a local Ollama instance via HTTP API.
 * Supports any installed Ollama model, with dynamic discovery.
 */
export class OllamaProvider extends AbstractModelProvider {
  public readonly id: ProviderId = 'ollama';
  public readonly capabilities = OLLAMA_CAPABILITIES;

  protected logger: ProviderLogger;

  constructor(config: ProviderConfig) {
    super(config);
    this.logger = new ProviderLogger('OllamaProvider', LogLevel.INFO);
  }

  protected async doInitialize(): Promise<void> {
    // Verify Ollama is accessible with a health check
    const health = await this.healthCheck();
    if (health.status === 'unavailable') {
      throw new ProviderUnavailableError(
        `Ollama is not accessible at ${this.config.baseUrl}. Is Ollama running?`,
        { providerId: this.id }
      );
    }

    this.logger.logInitialized(this.id, 0);
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const durationMs = Date.now() - startTime;

      if (response.ok) {
        this.logger.logHealthCheck(this.id, 'healthy', durationMs);
        return {
          status: 'healthy',
          responseTimeMs: durationMs,
          lastCheckedAt: new Date(),
        };
      } else {
        const errorText = await response.text();
        this.logger.logHealthCheck(this.id, 'unavailable', durationMs, errorText);
        return {
          status: 'unavailable',
          responseTimeMs: durationMs,
          lastCheckedAt: new Date(),
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.logHealthCheck(this.id, 'unavailable', durationMs, errorMessage);

      return {
        status: 'unavailable',
        responseTimeMs: durationMs,
        lastCheckedAt: new Date(),
        error: errorMessage,
      };
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    const startTime = Date.now();

    try {
      const response = await this.fetchOllama('/api/tags', { method: 'GET' });
      const data = await this.parseResponse<OllamaTagsResponse>(response);

      if (!data.models || !Array.isArray(data.models)) {
        throw new ParseError('Invalid response format from Ollama');
      }

      const models = data.models.map((ollamaModel) => {
        const id = ollamaModel.name;
        const qualifiedId: ModelId = `ollama:${id}`;

        // Parse context window from details if available
        const contextWindow = this.estimateContextWindow(ollamaModel.details?.parameter_size);

        return {
          id,
          qualifiedId,
          name: id,
          provider: this.id,
          description: `Ollama model: ${id}`,
          contextWindow,
          parameterCount: this.parseParameterSize(ollamaModel.details?.parameter_size),
          capabilities: {
            chat: true,
            streaming: true,
            functionCalling: false, // Ollama doesn't support this natively
            vision: false, // Would require specific vision models
            maxContextTokens: contextWindow,
          },
          metadata: {
            size: ollamaModel.size,
            digest: ollamaModel.digest,
            modifiedAt: ollamaModel.modified_at,
            families: ollamaModel.details?.families,
          },
        } as ModelInfo;
      });

      const durationMs = Date.now() - startTime;
      this.logger.logModelDiscovery(this.id, 'list', undefined, models.length);

      return models;
    } catch (error) {
      this.logger.logError(this.id, { code: 'PROVIDER_UNAVAILABLE', retryable: true });
      throw normalizeError(error, this.id);
    }
  }

  async getModel(modelId: string): Promise<ModelInfo | null> {
    const unqualifiedId = this.unqualifyModelId(modelId);

    try {
      const models = await this.listModels();
      const model = models.find((m) => m.id === unqualifiedId || m.qualifiedId === modelId);

      this.logger.logModelDiscovery(this.id, 'get', unqualifiedId, model ? 1 : 0);

      return model || null;
    } catch (error) {
      this.logger.logError(this.id, { code: 'PROVIDER_UNAVAILABLE', retryable: true });
      throw normalizeError(error, this.id, unqualifiedId);
    }
  }

  async hasModel(modelId: string): Promise<boolean> {
    const model = await this.getModel(modelId);
    return model !== null;
  }

  async chat(
    messages: ChatMessage[],
    modelId: string,
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    const unqualifiedId = this.unqualifyModelId(modelId);
    const { stream = false, signal, timeoutMs = this.config.defaultTimeoutMs } = options;

    this.ensureInitialized();

    this.logger.logChatStart(this.id, this.qualifyModelId(unqualifiedId), {
      stream: false, // Non-streaming
      messageCount: messages.length,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
    });

    const request: OllamaChatRequest = {
      model: unqualifiedId,
      messages: this.convertMessages(messages),
      stream: false,
      options: this.buildOllamaOptions(options),
    };

    const startTime = Date.now();

    try {
      const response = await this.fetchWithTimeout(
        '/api/chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        },
        timeoutMs,
        signal
      );

      const data = await this.parseResponse<OllamaChatResponse>(response);

      if (!data.message) {
        throw new ParseError('Invalid response: missing message');
      }

      const durationMs = Date.now() - startTime;

      const result: ChatCompletionResponse = {
        id: `ollama-${Date.now()}-${unqualifiedId}`,
        provider: this.id,
        model: this.qualifyModelId(unqualifiedId),
        message: {
          role: this.convertRoleToStandard(data.message.role),
          content: data.message.content,
        },
        usage: this.extractUsage(data),
        finishReason: 'stop', // Ollama doesn't provide this explicitly
        createdAt: new Date(),
        metadata: {
          totalDuration: data.total_duration,
          loadDuration: data.load_duration,
        },
      };

      this.logger.logChatComplete(this.id, this.qualifyModelId(unqualifiedId), {
        durationMs,
        tokenCount: result.usage.totalTokens,
        finishReason: result.finishReason,
      });

      return result;
    } catch (error) {
      throw this.handleError(error, unqualifiedId);
    }
  }

  async *streamChat(
    messages: ChatMessage[],
    modelId: string,
    options: ChatCompletionOptions = {}
  ): AsyncIterable<ChatCompletionChunk> {
    const unqualifiedId = this.unqualifyModelId(modelId);
    const { signal, timeoutMs = this.config.defaultTimeoutMs } = options;

    this.ensureInitialized();

    this.logger.logChatStart(this.id, this.qualifyModelId(unqualifiedId), {
      stream: true,
      messageCount: messages.length,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
    });

    const request: OllamaChatRequest = {
      model: unqualifiedId,
      messages: this.convertMessages(messages),
      stream: true,
      options: this.buildOllamaOptions(options),
    };

    const requestBody = JSON.stringify(request);

    try {
      const response = await this.fetchWithTimeout(
        '/api/chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        },
        timeoutMs,
        signal
      );

      if (!response.body) {
        throw new ParseError('No response body for streaming request');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Handle cancellation
      const cleanup = () => {
        reader.releaseLock();
      };

      signal?.addEventListener('abort', () => {
        cleanup();
      });

      try {
        while (true) {
          // Check for cancellation before reading
          if (signal?.aborted) {
            this.logger.logCancel(this.id, this.qualifyModelId(unqualifiedId), 'user_requested');
            throw new CancelledError({ providerId: this.id, modelId: unqualifiedId });
          }

          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const chunk = JSON.parse(line) as OllamaStreamChunk;
              const chunkResponse: ChatCompletionChunk = {
                id: `ollama-stream-${Date.now()}`,
                model: this.qualifyModelId(unqualifiedId),
                provider: this.id,
                delta: {
                  content: chunk.message?.content || '',
                  role: this.convertRoleToStandard(chunk.message?.role || 'assistant'),
                },
                isFinal: chunk.done,
                finishReason: chunk.done ? 'stop' : undefined,
              };

              this.logger.logStreamChunk(this.id, this.qualifyModelId(unqualifiedId), chunk.done);

              yield chunkResponse;

              if (chunk.done) {
                return;
              }
            } catch (parseError) {
              this.logger.warn('Failed to parse stream chunk', { line }); // Keep warn method
              // Continue processing other chunks
            }
          }
        }
      } finally {
        cleanup();
      }
    } catch (error) {
      throw this.handleError(error, unqualifiedId);
    }
  }

  protected async doDispose(): Promise<void> {
    this.logger.logDispose(this.id);
  }

  // --------------------------------------------------------------------------
  // Private helper methods
  // --------------------------------------------------------------------------

  /**
   * Make a fetch request to Ollama API.
   */
  private async fetchOllama(path: string, init: RequestInit): Promise<Response> {
    const url = this.buildUrl(path);
    return fetch(url, init);
  }

  /**
   * Make a fetch request with timeout and abort signal support.
   */
  private async fetchWithTimeout(
    path: string,
    init: RequestInit,
    timeoutMs: number,
    signal?: AbortSignal
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      const combinedSignal = signal
        ? this.combineSignals(controller.signal, signal)
        : controller.signal;

      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new TimeoutError(timeoutMs, { providerId: this.id }));
      }, timeoutMs);

      this.fetchOllama(path, { ...init, signal: combinedSignal })
        .then((response) => {
          clearTimeout(timeoutId);
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Combine two abort signals.
   */
  private combineSignals(signal1: AbortSignal, signal2: AbortSignal): AbortSignal {
    const controller = new AbortController();

    const onAbort = () => controller.abort();
    signal1.addEventListener('abort', onAbort);
    signal2.addEventListener('abort', onAbort);

    return controller.signal;
  }

  /**
   * Parse JSON response, handling errors.
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');

      // Special handling for model not found
      if (response.status === 404) {
        if (errorText.includes('model') || errorText.includes('not found')) {
          throw new ModelNotFoundError('unknown', this.id);
        }
      }

      throw new ProviderUnavailableError(`HTTP ${response.status}: ${errorText}`, {
        providerId: this.id,
        httpStatus: response.status,
      });
    }

    const text = await response.text();

    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      throw new ParseError(
        `Failed to parse response: ${parseError instanceof Error ? parseError.message : String(parseError)}`
      );
    }
  }

  /**
   * Convert standard messages to Ollama format.
   */
  private convertMessages(messages: ChatMessage[]): OllamaMessage[] {
    return messages.map((msg) => ({
      role: this.convertRoleToOllama(msg.role),
      content: msg.content,
    }));
  }

  /**
   * Convert standard role to Ollama role.
   */
  private convertRoleToOllama(role: MessageRole): OllamaRole {
    switch (role) {
      case 'system':
        return 'system';
      case 'user':
        return 'user';
      case 'assistant':
      case 'tool':
        return 'assistant';
      default:
        return 'user';
    }
  }

  /**
   * Convert Ollama role to standard role.
   */
  private convertRoleToStandard(role: OllamaRole): MessageRole {
    switch (role) {
      case 'system':
        return 'system';
      case 'user':
        return 'user';
      case 'assistant':
        return 'assistant';
      default:
        return 'assistant';
    }
  }

  /**
   * Build Ollama-specific options.
   */
  private buildOllamaOptions(options: ChatCompletionOptions): OllamaChatRequest['options'] {
    const ollamaOptions: OllamaChatRequest['options'] = {};

    if (options.temperature !== undefined) {
      ollamaOptions.temperature = options.temperature;
    }

    if (options.maxTokens !== undefined) {
      ollamaOptions.num_predict = options.maxTokens;
    }

    if (options.topP !== undefined) {
      ollamaOptions.top_p = options.topP;
    }

    if (options.topK !== undefined) {
      ollamaOptions.top_k = options.topK;
    }

    if (options.frequencyPenalty !== undefined) {
      ollamaOptions.frequency_penalty = options.frequencyPenalty;
    }

    if (options.presencePenalty !== undefined) {
      ollamaOptions.presence_penalty = options.presencePenalty;
    }

    if (options.seed !== undefined) {
      ollamaOptions.seed = options.seed;
    }

    if (options.stopSequences !== undefined && options.stopSequences.length > 0) {
      ollamaOptions.stop = options.stopSequences;
    }

    return Object.keys(ollamaOptions).length > 0 ? ollamaOptions : undefined;
  }

  /**
   * Extract usage metadata from Ollama response.
   */
  private extractUsage(data: OllamaChatResponse): UsageMetadata {
    const promptTokens = data.prompt_eval_count ?? 0;
    const completionTokens = data.eval_count ?? 0;

    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }

  /**
   * Handle errors, normalizing them to ModelProviderError.
   */
  private handleError(error: unknown, modelId?: string): Error {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Check for specific Ollama error patterns
      if (message.includes('model') && message.includes('not found')) {
        return new ModelNotFoundError(modelId || 'unknown', this.id, { cause: error });
      }

      if (message.includes('pull') && message.includes('model')) {
        return new ModelNotLoadedError(modelId || 'unknown', this.id, { cause: error });
      }

      if (message.includes('timeout') || error.name === 'TimeoutError') {
        return new TimeoutError(this.config.defaultTimeoutMs, { providerId: this.id, modelId });
      }

      if (message.includes('abort') || message.includes('cancel')) {
        return new CancelledError({ providerId: this.id, modelId });
      }

      if (error.name === 'FetchError' || message.includes('fetch failed')) {
        return new ProviderUnavailableError('Failed to connect to Ollama. Is it running?', {
          providerId: this.id,
          cause: error,
        });
      }
    }

    return normalizeError(error, this.id, modelId);
  }

  /**
   * Estimate context window from parameter size string.
   */
  private estimateContextWindow(parameterSize: string | undefined): number | undefined {
    if (!parameterSize) return undefined;

    // Common context window sizes by model size
    const size = parameterSize.toLowerCase();
    if (size.includes('b')) {
      const match = size.match(/(\d+\.?\d*)/);
      if (match && match[1]) {
        const billions = parseFloat(match[1]);
        // Rough estimates - actual sizes vary by model
        if (billions < 10) return 32768;
        if (billions < 30) return 32768;
        if (billions < 70) return 32768;
        return 32768;
      }
    }

    return undefined;
  }

  /**
   * Parse parameter size string to approximate parameter count.
   */
  private parseParameterSize(parameterSize: string | undefined): number | undefined {
    if (!parameterSize) return undefined;

    const size = parameterSize.toLowerCase();
    const match = size.match(/(\d+\.?\d*)/);

    if (match && match[1]) {
      const billions = parseFloat(match[1]);
      return Math.round(billions * 1_000_000_000);
    }

    return undefined;
  }
}

/**
 * Factory function for creating an Ollama provider.
 */
export function createOllamaProvider(config?: Partial<ProviderConfig>): OllamaProvider {
  const fullConfig: ProviderConfig = {
    providerId: 'ollama',
    baseUrl: config?.baseUrl || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    defaultTimeoutMs: config?.defaultTimeoutMs || 30000,
    apiKey: config?.apiKey, // Ollama doesn't use API keys, but accept for interface compatibility
  };

  return new OllamaProvider(fullConfig);
}
