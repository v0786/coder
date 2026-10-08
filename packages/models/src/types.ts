/**
 * CODER Model Provider Types
 * Core type definitions for the Model Provider Layer (Phase 2)
 */

// ============================================================================
// Provider Identity Types
// ============================================================================

/** Unique identifier for a model provider (e.g., 'ollama', 'openai', 'anthropic') */
export type ProviderId = string;

/** Unique identifier for a specific model (format: provider:model) */
export type ModelId = string;

// ============================================================================
// Message Types
// ============================================================================

/** Role of a message sender in a chat conversation */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/** A single message in a chat conversation */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  /** Optional name identifier (e.g., for tool calls) */
  name?: string;
  /** Optional tool call information */
  toolCalls?: ToolCall[];
}

/** Tool call within a message */
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/** Tool result message content */
export interface ToolMessage {
  toolCallId: string;
  role: 'tool';
  content: string;
}

// ============================================================================
// Generation Options
// ============================================================================

/** Common generation parameters for chat/completion requests */
export interface GenerationOptions {
  /** Temperature controls randomness (0.0 = deterministic, 1.0+ = creative) */
  temperature?: number;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  /** Stop sequences to end generation */
  stopSequences?: string[];
  /** Top-p sampling (0.0-1.0) */
  topP?: number;
  /** Top-k sampling (0 = disabled, 1+ = limit) */
  topK?: number;
  /** Frequency penalty (-2.0 to 2.0) */
  frequencyPenalty?: number;
  /** Presence penalty (-2.0 to 2.0) */
  presencePenalty?: number;
  /** Seed for reproducible outputs */
  seed?: number;
  /** Context window size (provider-specific) */
  contextWindow?: number;
  /** Additional provider-specific options */
  [key: string]: unknown;
}

/** Extended options that include streaming configuration */
export interface ChatCompletionOptions extends GenerationOptions {
  /** Whether to stream the response */
  stream?: boolean;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
  /** Timeout in milliseconds */
  timeoutMs?: number;
}

// ============================================================================
// Response Types
// ============================================================================

/** Reason the generation finished */
export type FinishReason =
  'stop' | 'length' | 'content_filter' | 'tool_calls' | 'error' | 'unknown';

/** Token usage metadata */
export interface UsageMetadata {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** Standard chat completion response */
export interface ChatCompletionResponse {
  /** Unique identifier for this response */
  id: string;
  /** The provider that generated this response */
  provider: ProviderId;
  /** The model used for this response */
  model: ModelId;
  /** The generated message */
  message: ChatMessage;
  /** Token usage information */
  usage: UsageMetadata;
  /** Why the generation stopped */
  finishReason: FinishReason;
  /** When the response was created */
  createdAt: Date;
  /** Provider-specific additional data */
  metadata?: Record<string, unknown>;
}

/** A single chunk in a streaming response */
export interface ChatCompletionChunk {
  /** Unique identifier for this chunk (matches response ID) */
  id: string;
  /** The model generating this chunk */
  model: ModelId;
  /** The provider generating this chunk */
  provider: ProviderId;
  /** Content delta (incremental content) */
  delta: {
    content?: string;
    role?: MessageRole;
  };
  /** Whether this is the final chunk */
  isFinal: boolean;
  /** Finish reason if this is the final chunk */
  finishReason?: FinishReason;
}

// ============================================================================
// Model Metadata
// ============================================================================

/** Information about an available model */
export interface ModelInfo {
  /** Provider-scoped model identifier */
  id: string;
  /** Fully qualified model ID (provider:id) */
  qualifiedId: ModelId;
  /** Human-readable name */
  name: string;
  /** Model provider */
  provider: ProviderId;
  /** Model description */
  description?: string;
  /** Context window size in tokens */
  contextWindow?: number;
  /** Parameter count (if known) */
  parameterCount?: number;
  /** Supported features */
  capabilities: ModelCapabilities;
  /** When the model was created (if known) */
  createdAt?: Date;
  /** Provider-specific metadata */
  metadata?: Record<string, unknown>;
}

/** Capabilities supported by a model */
export interface ModelCapabilities {
  /** Supports chat/completion */
  chat: boolean;
  /** Supports streaming */
  streaming: boolean;
  /** Supports function calling */
  functionCalling?: boolean;
  /** Supports vision/image input */
  vision?: boolean;
  /** Supports JSON mode */
  jsonMode?: boolean;
  /** Maximum context window */
  maxContextTokens?: number;
  /** Maximum output tokens */
  maxOutputTokens?: number;
}

// ============================================================================
// Provider Capabilities
// ============================================================================

/** Health status of a provider */
export type ProviderHealthStatus = 'healthy' | 'degraded' | 'unavailable' | 'unknown';

/** Provider capability information */
export interface ProviderCapabilities {
  /** Provider supports streaming responses */
  streaming: boolean;
  /** Provider supports abort/cancellation */
  cancellation: boolean;
  /** Provider supports multiple models */
  multiModel: boolean;
  /** Provider supports local models */
  localModels: boolean;
  /** Provider requires authentication */
  requiresAuth: boolean;
  /** Supported features as a list */
  features: string[];
}

/** Provider health information */
export interface ProviderHealth {
  status: ProviderHealthStatus;
  /** Response time in milliseconds */
  responseTimeMs?: number;
  /** Last successful check */
  lastCheckedAt?: Date;
  /** Error message if unavailable */
  error?: string;
  /** Provider version if available */
  version?: string;
}

/** Provider configuration */
export interface ProviderConfig {
  /** Provider identifier */
  providerId: ProviderId;
  /** Base URL for the provider API */
  baseUrl: string;
  /** API key (if required) */
  apiKey?: string;
  /** Default timeout in milliseconds */
  defaultTimeoutMs: number;
  /** Additional provider-specific config */
  [key: string]: unknown;
}

// ============================================================================
// Error Types
// ============================================================================

/** Categories of provider errors */
export type ProviderErrorCode =
  | 'PROVIDER_UNAVAILABLE'
  | 'MODEL_NOT_FOUND'
  | 'MODEL_NOT_LOADED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_REQUEST'
  | 'AUTHENTICATION_ERROR'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'STREAM_ERROR'
  | 'PARSE_ERROR'
  | 'UNKNOWN_ERROR';

/** Normalized provider error */
export interface ProviderError {
  code: ProviderErrorCode;
  message: string;
  /** Original error if available */
  cause?: Error;
  /** HTTP status code if applicable */
  httpStatus?: number;
  /** Provider-specific error code */
  providerCode?: string;
  /** Whether this is a retryable error */
  retryable: boolean;
}

// ============================================================================
// Registry Types
// ============================================================================

// ModelProvider interface is defined in provider.ts to avoid circular imports.
// Import from './provider' to use ProviderFactory and RegisteredProvider.
