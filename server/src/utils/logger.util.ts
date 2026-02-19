/**
 * Logger Utility
 * Centralized logging configuration
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  requestId?: string;
  userId?: string;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(entry: LogEntry): string {
    const contextStr = entry.context ? ` | Context: ${JSON.stringify(entry.context)}` : '';
    const requestIdStr = entry.requestId ? ` | RequestId: ${entry.requestId}` : '';
    const userIdStr = entry.userId ? ` | UserId: ${entry.userId}` : '';
    
    return `[${entry.timestamp}] ${entry.level.toUpperCase()} ${entry.message}${contextStr}${requestIdStr}${userIdStr}`;
  }

  private log(level: LogLevel, message: string, context?: any, requestId?: string, userId?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      requestId,
      userId,
    };

    const formattedMessage = this.formatMessage(entry);
    
    // In development, log to console
    if (process.env.NODE_ENV !== 'production') {
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
      }
    }

    // In production, you might want to send to a logging service
    // this.sendToLoggingService(entry);
  }

  public error(message: string, context?: any, requestId?: string, userId?: string): void {
    this.log(LogLevel.ERROR, message, context, requestId, userId);
  }

  public warn(message: string, context?: any, requestId?: string, userId?: string): void {
    this.log(LogLevel.WARN, message, context, requestId, userId);
  }

  public info(message: string, context?: any, requestId?: string, userId?: string): void {
    this.log(LogLevel.INFO, message, context, requestId, userId);
  }

  public debug(message: string, context?: any, requestId?: string, userId?: string): void {
    this.log(LogLevel.DEBUG, message, context, requestId, userId);
  }

  // Convenience methods for common operations
  public requestStart(method: string, url: string, requestId: string, userId?: string): void {
    this.info(`Request started: ${method} ${url}`, { method, url }, requestId, userId);
  }

  public requestEnd(method: string, url: string, requestId: string, userId?: string, duration?: number): void {
    const context = { method, url, duration };
    this.info(`Request completed: ${method} ${url}`, context, requestId, userId);
  }

  public requestError(method: string, url: string, error: Error, requestId: string, userId?: string): void {
    this.error(`Request failed: ${method} ${url} - ${error.message}`, { 
      error: error.message, 
      stack: error.stack 
    }, requestId, userId);
  }

  public databaseQuery(query: string, duration?: number, requestId?: string): void {
    const context = { query, duration };
    this.debug(`Database query: ${query}`, context, requestId);
  }

  public databaseError(query: string, error: Error, requestId?: string): void {
    this.error(`Database query failed: ${query} - ${error.message}`, { 
      error: error.message, 
      stack: error.stack 
    }, requestId);
  }

  public userAction(action: string, userId: string, context?: any, requestId?: string): void {
    this.info(`User action: ${action}`, { action, ...context }, requestId, userId);
  }

  public securityEvent(event: string, context?: any, requestId?: string, userId?: string): void {
    this.warn(`Security event: ${event}`, context, requestId, userId);
  }

  public performanceMetric(metric: string, value: number, context?: any): void {
    this.info(`Performance: ${metric} = ${value}`, context);
  }

  // Private method for sending to external logging service
  private sendToLoggingService(entry: LogEntry): void {
    // Implementation would depend on your logging service
    // e.g., Winston, Pino, or a custom logging service
    // Example:
    // this.winston.log(entry.level, entry.message, entry);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
