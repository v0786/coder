/**
 * CODER Model Provider Interface
 * Base interface and abstract class for all model providers
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
} from './types';

/**
 * Model Provider interface - the contract all providers must implement.
 *
 * This interface defines the abstraction that CODER's core uses to interact
 * with any model inference provider (Ollama, OpenAI, Anthropic, etc.).
 *
 * Core principle: CODER's orchestrator depends only on this interface, never
 * on provider-specific implementations.
 */
export interface ModelProvider {
  /** Provider identifier (e.g., 'ollama', 'openai') */
  readonly id: ProviderId;

  /** Provider capabilities */
  readonly capabilities: ProviderCapabilities;

  /**
   * Initialize the provider.
   * Called once before the provider is used.
   */
  initialize(): Promise<void>;

  /**
   * Check the health of the provider.
   * @returns Health status information
   */
  healthCheck(): Promise<ProviderHealth>;

  /**
   * List all available models from this provider.
   * @returns Array of model information
   */
  listModels(): Promise<ModelInfo[]>;

  /**
   * Get information about a specific model.
   * @param modelId Provider-local model identifier
   * @returns Model information, or null if not found
   */
  getModel(modelId: string): Promise<ModelInfo | null>;

  /**
   * Check if a model exists and is available.
   * @param modelId Provider-local model identifier
   * @returns true if the model is available
   */
  hasModel(modelId: string): Promise<boolean>;

  /**
   * Send a chat completion request.
   * @param messages The conversation messages
   * @param modelId Provider-local model identifier
   * @param options Generation options
   * @returns The completion response
   * @throws {ModelProviderError} On provider errors
   */
  chat(
    messages: ChatMessage[],
    modelId: string,
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse>;

  /**
   * Send a streaming chat completion request.
   * @param messages The conversation messages
   * @param modelId Provider-local model identifier
   * @param options Generation options
   * @returns Async iterable of response chunks
   * @throws {ModelProviderError} On provider errors
   */
  streamChat(
    messages: ChatMessage[],
    modelId: string,
    options?: ChatCompletionOptions
  ): AsyncIterable<ChatCompletionChunk>;

  /**
   * Release any resources held by the provider.
   * Called when the provider is no longer needed.
   */
  dispose(): Promise<void>;
}

/**
 * Abstract base class for model providers.
 *
 * Provides common implementations and utilities that concrete providers
 * can inherit or override.
 */
export abstract class AbstractModelProvider implements ModelProvider {
  public abstract readonly id: ProviderId;
  public abstract readonly capabilities: ProviderCapabilities;

  /** Provider configuration */
  protected readonly config: ProviderConfig;

  /** Logger instance */
  protected logger: {
    debug: (message: string, meta?: Record<string, unknown>) => void;
    info: (message: string, meta?: Record<string, unknown>) => void;
    warn: (message: string, meta?: Record<string, unknown>) => void;
    error: (message: string, meta?: Record<string, unknown>) => void;
  };

  /** Whether the provider has been initialized */
  protected initialized = false;

  constructor(config: ProviderConfig) {
    this.config = config;

    // Simple logger that can be replaced
    this.logger = {
      debug: (msg: string, meta?: Record<string, unknown>) =>
        console.debug(`[${this.id}:debug] ${msg}`, meta || ''),
      info: (msg: string, meta?: Record<string, unknown>) =>
        console.info(`[${this.id}:info] ${msg}`, meta || ''),
      warn: (msg: string, meta?: Record<string, unknown>) =>
        console.warn(`[${this.id}:warn] ${msg}`, meta || ''),
      error: (msg: string, meta?: Record<string, unknown>) =>
        console.error(`[${this.id}:error] ${msg}`, meta || ''),
    };
  }

  /**
   * Get the qualified model ID (provider:model).
   */
  protected qualifyModelId(modelId: string): ModelId {
    if (modelId.includes(':') && modelId.split(':').length === 2) {
      // Already qualified (e.g., "ollama:llama2")
      const [provider] = modelId.split(':');
      if (provider === this.id) {
        return modelId as ModelId;
      }
    }
    // Not qualified, add provider prefix
    return `${this.id}:${modelId}`;
  }

  /**
   * Strip the provider prefix from a model ID if present.
   */
  protected unqualifyModelId(modelId: string): string {
    if (modelId.includes(':')) {
      const [provider, ...modelParts] = modelId.split(':');
      if (provider === this.id) {
        return modelParts.join(':');
      }
    }
    return modelId;
  }

  /**
   * Validate that the provider is initialized.
   * @throws {ProviderUnavailableError} If not initialized
   */
  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(`Provider ${this.id} has not been initialized. Call initialize() first.`);
    }
  }

  /**
   * Build the full request URL.
   */
  protected buildUrl(path: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Create a timeout promise that rejects after a given duration.
   */
  protected createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Already initialized');
      return;
    }

    this.logger.info('Initializing provider', { baseUrl: this.config.baseUrl });
    await this.doInitialize();
    this.initialized = true;
    this.logger.info('Provider initialized successfully');
  }

  /**
   * Concrete provider initialization logic.
   * Override this instead of initialize().
   */
  protected abstract doInitialize(): Promise<void>;

  abstract healthCheck(): Promise<ProviderHealth>;
  abstract listModels(): Promise<ModelInfo[]>;
  abstract getModel(modelId: string): Promise<ModelInfo | null>;
  abstract hasModel(modelId: string): Promise<boolean>;
  abstract chat(
    messages: ChatMessage[],
    modelId: string,
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse>;
  abstract streamChat(
    messages: ChatMessage[],
    modelId: string,
    options?: ChatCompletionOptions
  ): AsyncIterable<ChatCompletionChunk>;

  async dispose(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.logger.info('Disposing provider');
    await this.doDispose();
    this.initialized = false;
    this.logger.info('Provider disposed');
  }

  /**
   * Concrete provider disposal logic.
   * Override this instead of dispose().
   */
  protected abstract doDispose(): Promise<void>;
}

/**
 * Provider factory function - defined here to avoid circular imports.
 */
export type ProviderFactory = (config: ProviderConfig) => ModelProvider;

/**
 * Entry in the provider registry - defined here to avoid circular imports.
 */
export interface RegisteredProvider {
  id: ProviderId;
  factory: ProviderFactory;
  defaultConfig: Partial<ProviderConfig>;
  capabilities: ProviderCapabilities;
}
