import config from '../../packages/config';
import { createLogger } from '../../packages/core/logging';
import { ConfigurationError, ModelError } from '../../packages/core/errors';
// Mock console.log for testing
const originalConsoleLog = console.log;
beforeAll(() => {
    console.log = jest.fn();
});
afterAll(() => {
    console.log = originalConsoleLog;
});
describe('Configuration', () => {
    it('should have default OLLAMA_BASE_URL', () => {
        expect(config.OLLAMA_BASE_URL).toBe('http://127.0.0.1:11434');
    });
    it('should have default DATA_DIR', () => {
        expect(config.DATA_DIR).toBe('./data');
    });
    it('should have default LOG_DIR', () => {
        expect(config.LOG_DIR).toBe('./logs');
    });
    it('should have default LOG_LEVEL', () => {
        expect(config.LOG_LEVEL).toBe('INFO');
    });
    it('should have default DEBUG mode', () => {
        expect(config.DEBUG).toBe(false);
    });
});
describe('Logging', () => {
    it('should create a logger', () => {
        const logger = createLogger('test');
        expect(logger).toBeDefined();
        expect(logger).toBeInstanceOf(Object);
    });
    it('should log messages at different levels', () => {
        const logger = createLogger('test');
        // Spy on console methods
        const consoleDebugSpy = jest.spyOn(console, 'debug');
        const consoleInfoSpy = jest.spyOn(console, 'info');
        const consoleWarnSpy = jest.spyOn(console, 'warn');
        const consoleErrorSpy = jest.spyOn(console, 'error');
        logger.debug('Debug message');
        logger.info('Info message');
        logger.warn('Warning message');
        logger.error('Error message');
        expect(consoleDebugSpy).toHaveBeenCalled();
        expect(consoleInfoSpy).toHaveBeenCalled();
        expect(consoleWarnSpy).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
        // Restore spies
        consoleDebugSpy.mockRestore();
        consoleInfoSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });
});
describe('Error Handling', () => {
    it('should create a ConfigurationError', () => {
        const error = new ConfigurationError('Test error');
        expect(error).toBeDefined();
        expect(error.name).toBe('ConfigurationError');
        expect(error.code).toBe('CONFIG_ERROR');
        expect(error.message).toBe('Test error');
    });
    it('should create a ModelError', () => {
        const error = new ModelError('Test error');
        expect(error).toBeDefined();
        expect(error.name).toBe('ModelError');
        expect(error.code).toBe('MODEL_ERROR');
        expect(error.message).toBe('Test error');
    });
});
//# sourceMappingURL=config.test.js.map