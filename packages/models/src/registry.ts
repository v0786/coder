/**
 * CODER Model Provider Registry
 * Simple registry for provider registration and lookup
 */

import type { ProviderId, ProviderConfig, ProviderCapabilities } from './types';
import type { ModelProvider, ProviderFactory, RegisteredProvider } from './provider';

/**
 * Registry for model providers.
 *
 * Facilitates provider discovery and instantiation without hard-coding
 * provider implementations in the core.
 *
 * Note: This is Phase 2 - a foundation for provider discovery.
 * Phase 3 will add intelligent model routing.
 */
export class ProviderRegistry {
  /** Map of registered providers */
  private providers = new Map<ProviderId, RegisteredProvider>();

  /** Active provider instances */
  private instances = new Map<ProviderId, ModelProvider>();

  /**
   * Register a provider factory.
   * @param entry The provider registration entry
   * @throws Error if provider is already registered
   */
  register(entry: RegisteredProvider): void {
    if (this.providers.has(entry.id)) {
      throw new Error(`Provider "${entry.id}" is already registered`);
    }

    this.providers.set(entry.id, entry);
  }

  /**
   * Unregister a provider.
   * @param providerId The provider identifier
   * @returns true if the provider was found and removed
   */
  unregister(providerId: ProviderId): boolean {
    // Dispose instance if it exists
    const instance = this.instances.get(providerId);
    if (instance) {
      void instance.dispose();
      this.instances.delete(providerId);
    }

    return this.providers.delete(providerId);
  }

  /**
   * Check if a provider is registered.
   * @param providerId The provider identifier
   * @returns true if registered
   */
  hasProvider(providerId: ProviderId): boolean {
    return this.providers.has(providerId);
  }

  /**
   * Get registered provider metadata.
   * @param providerId The provider identifier
   * @returns The registration entry, or undefined if not found
   */
  getRegistration(providerId: ProviderId): RegisteredProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Get all registered providers.
   * @returns Array of registration entries
   */
  getRegistrations(): RegisteredProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Create and initialize a provider instance.
   * @param providerId The provider identifier
   * @param config Provider configuration (merged with defaults)
   * @returns The initialized provider instance
   * @throws Error if provider is not registered
   */
  async createProvider(
    providerId: ProviderId,
    config?: Partial<ProviderConfig>
  ): Promise<ModelProvider> {
    // Check for existing instance
    const existing = this.instances.get(providerId);
    if (existing) {
      return existing;
    }

    // Get registration
    const registration = this.providers.get(providerId);
    if (!registration) {
      throw new Error(
        `Provider "${providerId}" is not registered. Available providers: ${this.listAvailable()}`
      );
    }

    // Merge config with defaults
    const mergedConfig: ProviderConfig = {
      providerId,
      baseUrl: config?.baseUrl ?? registration.defaultConfig.baseUrl ?? 'http://localhost',
      defaultTimeoutMs:
        config?.defaultTimeoutMs ?? registration.defaultConfig.defaultTimeoutMs ?? 30000,
      apiKey: config?.apiKey ?? registration.defaultConfig.apiKey,
      ...registration.defaultConfig,
      ...config,
    };

    // Create instance
    const instance = registration.factory(mergedConfig);

    // Initialize
    await instance.initialize();

    // Store instance
    this.instances.set(providerId, instance);

    return instance;
  }

  /**
   * Get an existing provider instance.
   * @param providerId The provider identifier
   * @returns The provider instance, or undefined if not created yet
   */
  getInstance(providerId: ProviderId): ModelProvider | undefined {
    return this.instances.get(providerId);
  }

  /**
   * Get or create a provider instance.
   * @param providerId The provider identifier
   * @param config Optional configuration (used only if creating)
   * @returns The provider instance
   */
  async getOrCreateInstance(
    providerId: ProviderId,
    config?: Partial<ProviderConfig>
  ): Promise<ModelProvider> {
    const existing = this.instances.get(providerId);
    if (existing) {
      return existing;
    }

    return this.createProvider(providerId, config);
  }

  /**
   * List all available provider IDs.
   * @returns Array of provider IDs
   */
  listAvailable(): ProviderId[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get all active instances.
   * @returns Map of provider ID to instance
   */
  getActiveInstances(): ReadonlyMap<ProviderId, ModelProvider> {
    return new Map(this.instances);
  }

  /**
   * Dispose all active provider instances.
   */
  async disposeAll(): Promise<void> {
    const disposePromises: Promise<void>[] = [];

    for (const [id, instance] of this.instances) {
      disposePromises.push(
        instance.dispose().catch((err) => {
          console.error(`Error disposing provider "${id}":`, err);
        })
      );
    }

    await Promise.all(disposePromises);
    this.instances.clear();
  }

  /**
   * Clear the registry (dispose all and unregister all).
   */
  async clear(): Promise<void> {
    await this.disposeAll();
    this.providers.clear();
  }
}

// ============================================================================
// Global Registry Instance
// ============================================================================

/** Singleton registry instance */
export const globalRegistry = new ProviderRegistry();

/**
 * Decorator function to register a provider class.
 *
 * Usage:
 * ```typescript
 * @registerProvider({
 *   id: 'ollama',
 *   capabilities: { ... },
 *   defaultConfig: { ... }
 * })
 * class OllamaProvider implements ModelProvider { ... }
 * ```
 */
export function registerProvider(metadata: Omit<RegisteredProvider, 'factory'>): ClassDecorator {
  return (target) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const constructor = target as unknown as new (...args: any[]) => any;

    const entry: RegisteredProvider = {
      ...metadata,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      factory: (config: ProviderConfig) => new (constructor as any)(config) as any,
    };

    globalRegistry.register(entry);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return target as any;
  };
}

/**
 * Helper to create a provider registration.
 */
export function createProviderRegistration(
  id: ProviderId,
  factory: ProviderFactory,
  capabilities: ProviderCapabilities,
  defaultConfig: Partial<ProviderConfig> = {}
): RegisteredProvider {
  return {
    id,
    factory,
    capabilities,
    defaultConfig,
  };
}
