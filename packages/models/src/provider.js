/**
 * CODER Model Provider Interface
 * Base interface and abstract class for all model providers
 */
/**
 * Abstract base class for model providers.
 *
 * Provides common implementations and utilities that concrete providers
 * can inherit or override.
 */
export class AbstractModelProvider {
    /** Provider configuration */
    config;
    /** Logger instance */
    logger;
    /** Whether the provider has been initialized */
    initialized = false;
    constructor(config) {
        this.config = config;
        // Simple logger that can be replaced
        this.logger = {
            debug: (msg, meta) => console.debug(`[${this.id}:debug] ${msg}`, meta || ''),
            info: (msg, meta) => console.info(`[${this.id}:info] ${msg}`, meta || ''),
            warn: (msg, meta) => console.warn(`[${this.id}:warn] ${msg}`, meta || ''),
            error: (msg, meta) => console.error(`[${this.id}:error] ${msg}`, meta || ''),
        };
    }
    /**
     * Get the qualified model ID (provider:model).
     */
    qualifyModelId(modelId) {
        if (modelId.includes(':') && modelId.split(':').length === 2) {
            // Already qualified (e.g., "ollama:llama2")
            const [provider] = modelId.split(':');
            if (provider === this.id) {
                return modelId;
            }
        }
        // Not qualified, add provider prefix
        return `${this.id}:${modelId}`;
    }
    /**
     * Strip the provider prefix from a model ID if present.
     */
    unqualifyModelId(modelId) {
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
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error(`Provider ${this.id} has not been initialized. Call initialize() first.`);
        }
    }
    /**
     * Build the full request URL.
     */
    buildUrl(path) {
        const baseUrl = this.config.baseUrl.replace(/\/$/, '');
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${cleanPath}`;
    }
    /**
     * Create a timeout promise that rejects after a given duration.
     */
    createTimeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
        });
    }
    async initialize() {
        if (this.initialized) {
            this.logger.warn('Already initialized');
            return;
        }
        this.logger.info('Initializing provider', { baseUrl: this.config.baseUrl });
        await this.doInitialize();
        this.initialized = true;
        this.logger.info('Provider initialized successfully');
    }
    async dispose() {
        if (!this.initialized) {
            return;
        }
        this.logger.info('Disposing provider');
        await this.doDispose();
        this.initialized = false;
        this.logger.info('Provider disposed');
    }
}
//# sourceMappingURL=provider.js.map