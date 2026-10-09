import { ModelProvider } from './provider';
import { ModelScorer } from './scorer';
import { ProviderCapabilities } from './types';

/**
 * Model Registry
 * Maintains a registry of all available models and providers
 */
export class ModelRegistry {
  private providers: Map<string, ModelProvider> = new Map();
  private capabilities: Map<string, ProviderCapabilities> = new Map();

  /**
   * Register a new model provider
   * @param name - Unique name for the provider
   * @param provider - Instance of the ModelProvider
   * @param capabilities - Capabilities supported by this provider
   */
  registerProvider(
    name: string,
    provider: ModelProvider,
    capabilities: ProviderCapabilities
  ): void {
    this.providers.set(name, provider);
    this.capabilities.set(name, capabilities);
  }

  /**
   * Get a registered provider by name
   * @param name - Name of the provider
   * @returns The provider instance or null if not found
   */
  getProvider(name: string): ModelProvider | null {
    return this.providers.get(name) || null;
  }

  /**
   * Get capabilities for a provider
   * @param name - Name of the provider
   * @returns Provider capabilities or null if not found
   */
  getCapabilities(name: string): ProviderCapabilities | null {
    return this.capabilities.get(name) || null;
  }

  /**
   * List all registered providers
   * @returns Array of provider names
   */
  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * List all models from all providers
   * @returns Array of model names
   */
  async listAllModels(): Promise<string[]> {
    const models: string[] = [];

    for (const [name, provider] of this.providers) {
      try {
        const providerModels = await provider.listModels();
        models.push(...providerModels.map(model => `${name}:${model}`));
      } catch (error) {
        console.error(`Failed to list models from provider ${name}:`, error);
      }
    }

    return models;
  }
}

/**
 * Provider Registry
 * Singleton instance for managing model providers
 */
export const ProviderRegistry = new ModelRegistry();