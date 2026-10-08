import config from '../../config';

// Log levels
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Log message interface
interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  component?: string;
  executionId?: string;
  taskId?: string;
  agentId?: string;
  metadata?: Record<string, any>;
}

// Logger class
class Logger {
  private level: LogLevel;
  private component: string;

  constructor(component: string) {
    this.component = component;
    this.level = LogLevel[config.LOG_LEVEL as keyof typeof LogLevel] || LogLevel.INFO;
  }

  // Set log level
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  // Log message
  private log(level: LogLevel, message: string, metadata: Record<string, any> = {}): void {
    if (this.shouldLog(level)) {
      const logMessage: LogMessage = {
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
  private shouldLog(level: LogLevel): boolean {
    const levelValue = this.getLevelValue(level);
    const currentLevelValue = this.getLevelValue(this.level);
    return levelValue >= currentLevelValue;
  }

  // Get level value for comparison
  private getLevelValue(level: LogLevel): number {
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
  private formatMessage(logMessage: LogMessage): string {
    const { level, message, timestamp, component, executionId, taskId, agentId, metadata } =
      logMessage;
    const metaString = metadata ? ` ${JSON.stringify(metadata)}` : '';
    const executionString = executionId ? ` [execution:${executionId}]` : '';
    const taskString = taskId ? ` [task:${taskId}]` : '';
    const agentString = agentId ? ` [agent:${agentId}]` : '';
    const componentString = component ? ` [${component}]` : '';

    return `[${timestamp}] ${level}${componentString}${executionString}${taskString}${agentString}: ${message}${metaString}`;
  }

  // Output log message
  private output(message: string): void {
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
  debug(message: string, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, metadata: Record<string, any> = {}): void {
    this.log(LogLevel.ERROR, message, metadata);
  }
}

// Create logger factory
const createLogger = (component: string): Logger => {
  return new Logger(component);
};

export { Logger, LogLevel, createLogger };
export default Logger;
