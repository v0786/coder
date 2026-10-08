import { createLogger } from '../../packages/core/logging';
import config from '../../packages/config';
import { createOllamaProvider, ProviderUnavailableError, ModelNotFoundError, TimeoutError, CancelledError, } from '../../packages/models/src';
// Create logger for CLI
const logger = createLogger('CLI');
// Define commands
const commands = [];
// Add doctor command
commands.push({
    name: 'doctor',
    description: 'Check CODER system health and configuration',
    execute: async (_args) => {
        logger.info('Running CODER doctor...');
        // Check configuration
        logger.info('Checking configuration...');
        logger.info(`OLLAMA_BASE_URL: ${config.OLLAMA_BASE_URL}`);
        logger.info(`DATA_DIR: ${config.DATA_DIR}`);
        logger.info(`LOG_DIR: ${config.LOG_DIR}`);
        logger.info(`LOG_LEVEL: ${config.LOG_LEVEL}`);
        logger.info(`DEBUG: ${config.DEBUG}`);
        // Check logging system
        logger.info('Testing logging system...');
        logger.debug('This is a debug message');
        logger.info('This is an info message');
        logger.warn('This is a warning message');
        logger.error('This is an error message');
        logger.info('CODER doctor check completed successfully!');
    },
});
// Add model test command
commands.push({
    name: 'model',
    description: 'Model provider operations (test, list, etc.)',
    execute: async (args) => {
        const subcommand = args[0] || 'help';
        if (subcommand === 'test') {
            await handleModelTest(args.slice(1));
            return;
        }
        if (subcommand === 'list') {
            await handleModelList();
            return;
        }
        if (subcommand === 'health') {
            await handleModelHealth();
            return;
        }
        // Show help
        logger.info('Model commands:');
        logger.info('  model test <model-name>  - Test connection to a model');
        logger.info('  model list              - List available models');
        logger.info('  model health            - Check Ollama health');
    },
});
/**
 * Test a model connection
 */
async function handleModelTest(args) {
    const modelId = args[0] || 'qwen2.5-coder:7b';
    logger.info('='.repeat(60));
    logger.info('MODEL TEST: ' + modelId);
    logger.info('='.repeat(60));
    // Step 1: Check Ollama connectivity
    logger.info('\n[1/4] Checking Ollama connectivity...');
    const provider = createOllamaProvider({
        baseUrl: config.OLLAMA_BASE_URL,
        defaultTimeoutMs: 30000,
    });
    try {
        let health;
        try {
            health = await provider.healthCheck();
        }
        catch (e) {
            logger.error('❌ Ollama is not reachable at ' + config.OLLAMA_BASE_URL);
            logger.error('   Error: ' + (e instanceof Error ? e.message : String(e)));
            logger.error('   Is Ollama running? Run: ollama serve');
            process.exit(1);
        }
        if (health.status === 'unavailable') {
            logger.error('❌ Ollama is unavailable');
            if (health.error) {
                logger.error('   Error: ' + health.error);
            }
            process.exit(1);
        }
        logger.info(`✅ Ollama is reachable (response time: ${health.responseTimeMs}ms)`);
        // Step 2: Initialize provider
        logger.info('\n[2/4] Initializing provider...');
        try {
            await provider.initialize();
            logger.info('✅ Provider initialized successfully');
        }
        catch (e) {
            logger.error('❌ Failed to initialize provider');
            logger.error('   Error: ' + (e instanceof Error ? e.message : String(e)));
            process.exit(1);
        }
        // Step 3: Check if model exists
        logger.info('\n[3/4] Checking model availability...');
        try {
            const modelInfo = await provider.getModel(modelId);
            if (modelInfo) {
                logger.info(`✅ Model "${modelId}" is available`);
                if (modelInfo.contextWindow) {
                    logger.info(`   Context window: ${modelInfo.contextWindow} tokens`);
                }
            }
            else {
                logger.warn(`⚠️  Model "${modelId}" was not found`);
                logger.info('   Available models:');
                const models = await provider.listModels();
                if (models.length === 0) {
                    logger.info('   (No models found)');
                }
                else {
                    models.slice(0, 10).forEach((m) => {
                        logger.info(`   - ${m.id}`);
                    });
                    if (models.length > 10) {
                        logger.info(`   ... and ${models.length - 10} more`);
                    }
                }
                logger.info(`\n   To pull this model, run: ollama pull ${modelId}`);
                process.exit(1);
            }
        }
        catch (e) {
            logger.error('❌ Failed to check model availability');
            logger.error('   Error: ' + (e instanceof Error ? e.message : String(e)));
            process.exit(1);
        }
        // Step 4: Send test request
        logger.info('\n[4/4] Sending test request...');
        logger.info('   (This may take a moment as the model loads)');
        try {
            const response = await provider.chat([
                {
                    role: 'user',
                    content: 'Say "Hello from CODER!" and nothing else.',
                },
            ], modelId, { temperature: 0.1, maxTokens: 50 });
            logger.info('✅ Received response!');
            logger.info('\n--- Response ---');
            logger.info(response.message.content.trim());
            logger.info('---------------');
            logger.info(`\nToken usage: ${response.usage.totalTokens} total (${response.usage.promptTokens} prompt, ${response.usage.completionTokens} completion)`);
            logger.info(`Finish reason: ${response.finishReason}`);
        }
        catch (e) {
            logger.error('❌ Failed to send test request');
            if (e instanceof ProviderUnavailableError) {
                logger.error('   Provider unavailable: ' + e.message);
            }
            else if (e instanceof ModelNotFoundError) {
                logger.error('   Model not found: ' + e.message);
            }
            else if (e instanceof TimeoutError) {
                logger.error('   Request timed out after ' + e.timeoutMs + 'ms');
                logger.error('   The model may be loading. Try again in a moment.');
            }
            else if (e instanceof CancelledError) {
                logger.error('   Request was cancelled');
            }
            else if (e instanceof Error) {
                logger.error('   Error: ' + e.message);
            }
            else {
                logger.error('   Unknown error: ' + String(e));
            }
            process.exit(1);
        }
        // Clean up
        await provider.dispose();
        logger.info('\n' + '='.repeat(60));
        logger.info('✅ MODEL TEST PASSED');
        logger.info('='.repeat(60));
    }
    catch (e) {
        logger.error('Unexpected error:');
        logger.error(e instanceof Error ? e.message : String(e));
        process.exit(1);
    }
}
/**
 * List available models
 */
async function handleModelList() {
    logger.info('Fetching available models from Ollama...');
    const provider = createOllamaProvider({
        baseUrl: config.OLLAMA_BASE_URL,
        defaultTimeoutMs: 10000,
    });
    try {
        await provider.initialize();
        const models = await provider.listModels();
        if (models.length === 0) {
            logger.info('No models found.');
            logger.info('To pull a model, run: ollama pull <model-name>');
            return;
        }
        logger.info(`\nFound ${models.length} model(s):\n`);
        models.forEach((model) => {
            const id = model.id.padEnd(30);
            const context = model.contextWindow ? `(${model.contextWindow} ctx) ` : '';
            logger.info(`  ${id} ${context}- ${model.capabilities.chat ? 'chat ' : ''}${model.capabilities.streaming ? 'stream' : ''}`);
        });
        await provider.dispose();
    }
    catch (e) {
        logger.error('Failed to list models:');
        if (e instanceof ProviderUnavailableError) {
            logger.error('  Ollama is not running or not accessible at ' + config.OLLAMA_BASE_URL);
            logger.error('  Start Ollama with: ollama serve');
        }
        else if (e instanceof Error) {
            logger.error('  ' + e.message);
        }
        else {
            logger.error('  Unknown error: ' + String(e));
        }
        process.exit(1);
    }
}
/**
 * Check Ollama health
 */
async function handleModelHealth() {
    logger.info('Checking Ollama health...');
    logger.info('Base URL: ' + config.OLLAMA_BASE_URL);
    const provider = createOllamaProvider({
        baseUrl: config.OLLAMA_BASE_URL,
        defaultTimeoutMs: 10000,
    });
    const startTime = Date.now();
    const health = await provider.healthCheck();
    const totalTime = Date.now() - startTime;
    logger.info('\nResult:');
    logger.info(`  Status: ${health.status}`);
    if (health.status === 'healthy') {
        logger.info('✅ Ollama is healthy');
    }
    else if (health.status === 'degraded') {
        logger.warn('⚠️  Ollama is degraded');
    }
    else {
        logger.error('❌ Ollama is unavailable');
    }
    if (health.version) {
        logger.info(`  Version: ${health.version}`);
    }
    if (health.responseTimeMs) {
        logger.info(`  Response time: ${health.responseTimeMs}ms`);
    }
    if (health.error) {
        logger.error(`  Error: ${health.error}`);
    }
    logger.info(`\nTotal check time: ${totalTime}ms`);
}
// Main function
const main = async () => {
    try {
        logger.info('Starting CODER CLI...');
        // Parse command line arguments
        const args = process.argv.slice(2);
        // Check if any arguments were provided
        if (args.length === 0) {
            logger.info('No command specified. Available commands:');
            commands.forEach((command) => {
                logger.info(`  ${command.name}: ${command.description}`);
            });
            return;
        }
        // Find and execute the specified command
        const commandName = args[0];
        const commandArgs = args.slice(1);
        const command = commands.find((cmd) => cmd.name === commandName);
        if (!command) {
            logger.error(`Unknown command: ${commandName}`);
            logger.info('Available commands:');
            commands.forEach((command) => {
                logger.info(`  ${command.name}: ${command.description}`);
            });
            return;
        }
        // Execute the command
        await command.execute(commandArgs);
        logger.info('CODER CLI completed successfully.');
    }
    catch (error) {
        logger.error('CODER CLI encountered an error: ' + (error instanceof Error ? error.message : String(error)));
        process.exit(1);
    }
};
// Execute main function
main();
//# sourceMappingURL=index.js.map