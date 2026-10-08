/**
 * CODER Models Package
 * Main entry point for model provider functionality
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // Provider Identity
  ProviderId,
  ModelId,
  ProviderConfig,
  ProviderCapabilities,
  ProviderHealth,
  ProviderHealthStatus,

  // Messages
  MessageRole,
  ChatMessage,
  ToolCall,
  ToolMessage,

  // Options
  GenerationOptions,
  ChatCompletionOptions,

  // Responses
  FinishReason,
  UsageMetadata,
  ChatCompletionResponse,
  ChatCompletionChunk,

  // Model Info
  ModelInfo,
  ModelCapabilities,

  // Errors
  ProviderErrorCode,
  ProviderError,
} from './types';

// ============================================================================
// Provider Interface
// ============================================================================

export { ModelProvider, AbstractModelProvider } from './provider';

// ============================================================================
// Errors
// ============================================================================

export {
  ModelProviderError,
  ProviderUnavailableError,
  ModelNotFoundError,
  ModelNotLoadedError,
  RateLimitError,
  InvalidRequestError,
  AuthenticationError,
  TimeoutError,
  CancelledError,
  StreamError,
  ParseError,
  UnknownProviderError,
  isModelProviderError,
  isRetryableError,
  normalizeError,
} from './errors';

// ============================================================================
// Registry
// ============================================================================

export {
  ProviderRegistry,
  globalRegistry,
  registerProvider,
  createProviderRegistration,
} from './registry';

// ============================================================================
// Logging
// ============================================================================

export {
  ProviderLogger,
  createProviderLogger,
  LogLevel,
  sanitizeMessagesForLogging,
} from './logging';

// ============================================================================
// Providers
// ============================================================================

export { OllamaProvider, createOllamaProvider, OLLAMA_CAPABILITIES } from './providers';
