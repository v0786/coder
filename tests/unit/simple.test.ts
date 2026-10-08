import config from '../../packages/config';
import { createLogger } from '../../packages/core/logging';
import { ConfigurationError } from '../../packages/core/errors';

// Simple test to verify basic functionality
console.log('Running simple test...');

// Test configuration
console.log('Testing configuration...');
console.log(`OLLAMA_BASE_URL: ${config.OLLAMA_BASE_URL}`);
console.log(`DATA_DIR: ${config.DATA_DIR}`);
console.log(`LOG_DIR: ${config.LOG_DIR}`);
console.log(`LOG_LEVEL: ${config.LOG_LEVEL}`);
console.log(`DEBUG: ${config.DEBUG}`);

// Test logging
console.log('Testing logging...');
const logger = createLogger('simple-test');
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');

// Test error handling
console.log('Testing error handling...');
try {
  throw new ConfigurationError('Test error');
} catch (error) {
  console.log('Caught expected error:', (error as ConfigurationError).message);
}

console.log('Simple test completed successfully!');
