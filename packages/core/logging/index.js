import config from '../../config';
// Log levels
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (LogLevel = {}));
// Logger class
class Logger {
    level;
    component;
    constructor(component) {
        this.component = component;
        this.level = LogLevel[config.LOG_LEVEL] || LogLevel.INFO;
    }
    // Set log level
    setLevel(level) {
        this.level = level;
    }
    // Log message
    log(level, message, metadata = {}) {
        if (this.shouldLog(level)) {
            const logMessage = {
                level,
                message,
                timestamp: new Date().toISOString(),
                component: this.component,
                ...metadata,
            };
            // Format log message
            const formattedMessage = this.formatMessage(logMessage);
            // Output to console
            this.output(formattedMessage);
            // TODO: Add support for writing to files
        }
    }
    // Check if should log based on level
    shouldLog(level) {
        const levelValue = this.getLevelValue(level);
        const currentLevelValue = this.getLevelValue(this.level);
        return levelValue >= currentLevelValue;
    }
    // Get level value for comparison
    getLevelValue(level) {
        switch (level) {
            case LogLevel.DEBUG:
                return 1;
            case LogLevel.INFO:
                return 2;
            case LogLevel.WARN:
                return 3;
            case LogLevel.ERROR:
                return 4;
            default:
                return 2;
        }
    }
    // Format log message
    formatMessage(logMessage) {
        const { level, message, timestamp, component, executionId, taskId, agentId, metadata } = logMessage;
        const metaString = metadata ? ` ${JSON.stringify(metadata)}` : '';
        const executionString = executionId ? ` [execution:${executionId}]` : '';
        const taskString = taskId ? ` [task:${taskId}]` : '';
        const agentString = agentId ? ` [agent:${agentId}]` : '';
        const componentString = component ? ` [${component}]` : '';
        return `[${timestamp}] ${level}${componentString}${executionString}${taskString}${agentString}: ${message}${metaString}`;
    }
    // Output log message
    output(message) {
        switch (this.level) {
            case LogLevel.DEBUG:
                console.debug(message);
                break;
            case LogLevel.INFO:
                console.info(message);
                break;
            case LogLevel.WARN:
                console.warn(message);
                break;
            case LogLevel.ERROR:
                console.error(message);
                break;
        }
    }
    // Log methods
    debug(message, metadata = {}) {
        this.log(LogLevel.DEBUG, message, metadata);
    }
    info(message, metadata = {}) {
        this.log(LogLevel.INFO, message, metadata);
    }
    warn(message, metadata = {}) {
        this.log(LogLevel.WARN, message, metadata);
    }
    error(message, metadata = {}) {
        this.log(LogLevel.ERROR, message, metadata);
    }
}
// Create logger factory
const createLogger = (component) => {
    return new Logger(component);
};
export { Logger, LogLevel, createLogger };
export default Logger;
//# sourceMappingURL=index.js.map