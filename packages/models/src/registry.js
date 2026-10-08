/**
 * CODER Model Provider Registry
 * Simple registry for provider registration and lookup
 */
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
    providers = new Map();
    /** Active provider instances */
    instances = new Map();
    /**
     * Register a provider factory.
     * @param entry The provider registration entry
     * @throws Error if provider is already registered
     */
    register(entry) {
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
    unregister(providerId) {
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
    hasProvider(providerId) {
        return this.providers.has(providerId);
    }
    /**
     * Get registered provider metadata.
     * @param providerId The provider identifier
     * @returns The registration entry, or undefined if not found
     */
    getRegistration(providerId) {
        return this.providers.get(providerId);
    }
    /**
     * Get all registered providers.
     * @returns Array of registration entries
     */
    getRegistrations() {
        return Array.from(this.providers.values());
    }
    /**
     * Create and initialize a provider instance.
     * @param providerId The provider identifier
     * @param config Provider configuration (merged with defaults)
     * @returns The initialized provider instance
     * @throws Error if provider is not registered
     */
    async createProvider(providerId, config) {
        // Check for existing instance
        const existing = this.instances.get(providerId);
        if (existing) {
            return existing;
        }
        // Get registration
        const registration = this.providers.get(providerId);
        if (!registration) {
            throw new Error(`Provider "${providerId}" is not registered. Available providers: ${this.listAvailable()}`);
        }
        // Merge config with defaults
        const mergedConfig = {
            providerId,
            baseUrl: config?.baseUrl ?? registration.defaultConfig.baseUrl ?? 'http://localhost',
            defaultTimeoutMs: config?.defaultTimeoutMs ?? registration.defaultConfig.defaultTimeoutMs ?? 30000,
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
    getInstance(providerId) {
        return this.instances.get(providerId);
    }
    /**
     * Get or create a provider instance.
     * @param providerId The provider identifier
     * @param config Optional configuration (used only if creating)
     * @returns The provider instance
     */
    async getOrCreateInstance(providerId, config) {
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
    listAvailable() {
        return Array.from(this.providers.keys());
    }
    /**
     * Get all active instances.
     * @returns Map of provider ID to instance
     */
    getActiveInstances() {
        return new Map(this.instances);
    }
    /**
     * Dispose all active provider instances.
     */
    async disposeAll() {
        const disposePromises = [];
        for (const [id, instance] of this.instances) {
            disposePromises.push(instance.dispose().catch((err) => {
                console.error(`Error disposing provider "${id}":`, err);
            }));
        }
        await Promise.all(disposePromises);
        this.instances.clear();
    }
    /**
     * Clear the registry (dispose all and unregister all).
     */
    async clear() {
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
export function registerProvider(metadata) {
    return (target) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const constructor = target;
        const entry = {
            ...metadata,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            factory: (config) => new constructor(config),
        };
        globalRegistry.register(entry);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return target;
    };
}
/**
 * Helper to create a provider registration.
 */
export function createProviderRegistration(id, factory, capabilities, defaultConfig = {}) {
    return {
        id,
        factory,
        capabilities,
        defaultConfig,
    };
}
//# sourceMappingURL=registry.js.map