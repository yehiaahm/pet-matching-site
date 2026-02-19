/**
 * Centralized Logging Utility
 * Replaces console.log with structured, consistent logging
 */

// =============================================================================
// LOG LEVELS
// =============================================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
  OFF = 5
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  category: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  stack?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFileLogging: boolean;
  enableRemoteLogging: boolean;
  logFilePath?: string;
  remoteEndpoint?: string;
  apiKey?: string;
  structured: boolean;
  includeTimestamp: boolean;
  includeStackTrace: boolean;
  maxLogSize: number;
  enablePerformanceLogging: boolean;
}

// =============================================================================
// LOGGER CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG: LoggerConfig = {
  level: import.meta.env.VITE_LOG_LEVEL === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableFileLogging: false,
  enableRemoteLogging: false,
  structured: true,
  includeTimestamp: true,
  includeStackTrace: true,
  maxLogSize: 1000,
  enablePerformanceLogging: import.meta.env.VITE_DEBUG_MODE === 'true',
};

// =============================================================================
// LOG FORMATTERS
// =============================================================================

export interface LogFormatter {
  format(entry: LogEntry): string;
}

export interface ConsoleFormatter extends LogFormatter {
  format(entry: LogEntry): string;
}

export class StructuredFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const parts = [
      entry.timestamp,
      `[${LogLevel[entry.level]}]`,
      entry.category,
      entry.message
    ];

    // Add context information
    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(`Context: ${JSON.stringify(entry.context)}`);
    }

    // Add user information
    if (entry.userId) {
      parts.push(`User: ${entry.userId}`);
    }

    // Add session information
    if (entry.sessionId) {
      parts.push(`Session: ${entry.sessionId}`);
    }

    // Add request information
    if (entry.requestId) {
      parts.push(`Request: ${entry.requestId}`);
    }

    // Add component information
    if (entry.component) {
      parts.push(`Component: ${entry.component}`);
    }

    // Add action information
    if (entry.action) {
      parts.push(`Action: ${entry.action}`);
    }

    // Add metadata
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      parts.push(`Metadata: ${JSON.stringify(entry.metadata)}`);
    }

    // Add stack trace for errors
    if (entry.stack && entry.level >= LogLevel.ERROR) {
      parts.push(`Stack: ${entry.stack}`);
    }

    return parts.join(' | ');
  }
}

export class SimpleFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    return `[${LogLevel[entry.level]}] ${entry.timestamp} ${entry.category}: ${entry.message}`;
  }
}

export class ColoredFormatter implements ConsoleFormatter {
  format(entry: LogEntry): string {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[30m', // Gray
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m', // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level] || colors[LogLevel.INFO];
    
    return `${color}${entry.timestamp} [${LogLevel[entry.level]}] ${entry.category}: ${entry.message}${reset}`;
  }
}

export class JSONFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    return JSON.stringify(entry, null, 2);
  }
}

// =============================================================================
// LOGGER IMPLEMENTATION
// =============================================================================

export class Logger {
  private config: LoggerConfig;
  private formatter: LogFormatter;
  private logBuffer: LogEntry[] = [];
  private sessionId: string;
  private userId: string | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Choose formatter based on configuration
    if (this.config.structured) {
      this.formatter = new StructuredFormatter();
    } else {
      this.formatter = new SimpleFormatter();
    }
    
    // Generate session ID
    this.sessionId = this.generateSessionId();
    
    // Get user ID from auth context if available
    this.userId = this.getUserId();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getUserId(): string | null {
    // Try to get user ID from auth context
    try {
      // This would typically come from a global auth context or store
      const user = window.localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        return parsedUser.id || null;
      }
    } catch (error) {
      // Silently fail if user data is not available
      return null;
    }
    return null;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level && this.config.level !== LogLevel.OFF;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    category: string,
    context?: Record<string, any>,
    stack?: string
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      context,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      stack,
    };

    return entry;
  }

  private log(entry: LogEntry): void {
    // Add to buffer
    this.logBuffer.push(entry);

    // Trim buffer if it exceeds max size
    if (this.logBuffer.length > this.config.maxLogSize) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogSize);
    }

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // File logging
    if (this.config.enableFileLogging) {
      this.logToFile(entry);
    }

    // Remote logging
    if (this.config.enableRemoteLogging) {
      this.logToRemote(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const consoleMethod = this.getConsoleMethod(entry.level);
    const formattedMessage = this.formatter.format(entry);
    
    if (this.config.enableConsole) {
      consoleMethod(formattedMessage);
    }
  }

  private getConsoleMethod(level: LogLevel): (...args: any[]) => {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      case LogLevel.FATAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private logToFile(entry: LogEntry): void {
    // In a real implementation, this would write to a file
    // For now, we'll just log to console as fallback
    if (this.config.enableConsole) {
      console.log(`[FILE] ${this.formatter.format(entry)}`);
    }
  }

  private logToRemote(entry: LogEntry): void {
    // In a real implementation, this would send logs to a remote service
    // For now, we'll just log to console as fallback
    if (this.config.enableConsole) {
      console.log(`[REMOTE] ${this.formatter.format(entry)}`);
    }
  }

  // =============================================================================
  // PUBLIC LOGGING METHODS
  // =============================================================================

  debug(message: string, context?: Record<string, any>, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(
      LogLevel.DEBUG,
      message,
      'DEBUG',
      context,
      this.getStackTrace()
    );
    
    this.log(entry);
  }

  info(message: string, context?: Record<string, any>, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(
      LogLevel.INFO,
      message,
      'INFO',
      context,
      this.getStackTrace()
    );
    
    this.log(entry);
  }

  warn(message: string, context?: Record<string, any>, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(
      LogLevel.WARN,
      message,
      'WARN',
      context,
      this.getStackTrace()
    );
    
    this.log(entry);
  }

  error(message: string, context?: Record<string, any>, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(
      LogLevel.ERROR,
      message,
      'ERROR',
      context,
      this.getStackTrace()
    );
    
    this.log(entry);
  }

  fatal(message: string, context?: Record<string, any>, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.FATAL)) return;
    
    const entry = this.createLogEntry(
      LogLevel.FATAL,
      message,
      'FATAL',
      context,
      this.getStackTrace()
    );
    
    this.log(entry);
  }

  // =============================================================================
  // SPECIALIZED LOGGING METHODS
  // =============================================================================

  /**
   * Log authentication events
   */
  auth(message: string, context?: Record<string, any>): void {
    this.info(message, { ...context, category: 'AUTH' });
  }

  /**
   * Log API calls
   */
  api(message: string, context?: Record<string, any>): void {
    this.info(message, { ...context, category: 'API' });
  }

  /**
   * Log user actions
   */
  userAction(message: string, context?: Record<string, any>): void {
    this.info(message, { ...context, category: 'USER_ACTION' });
  }

  /**
   * Log system events
   */
  system(message: string, context?: Record<string, any>): void {
    this.info(message, { ...context, category: 'SYSTEM' });
  }

  /**
   * Log performance metrics
   */
  performance(message: string, context?: Record<string, any>): void {
    if (!this.config.enablePerformanceLogging) return;
    
    this.info(message, { ...context, category: 'PERFORMANCE' });
  }

  /**
   * Log security events
   */
  security(message: string, context?: Record<string, any>): void {
    this.warn(message, { ...context, category: 'SECURITY' });
  }

  /**
   * Log network requests
   */
  network(message: string, context?: Record<string, any>): void {
    this.info(message, { ...context, category: 'NETWORK' });
  }

  /**
   * Log database operations
   */
  database(message: string, context?: Record<string, any>): void {
    this.info(message, { ...context, category: 'DATABASE' });
  }

  /**
   * Log UI events
   */
  ui(message: string, context?: Record<string, any>): void {
    this.debug(message, { ...context, category: 'UI' });
  }

  /**
   * Log component lifecycle events
   */
  component(message: string, context?: Record<string, any>): void {
    this.debug(message, { ...context, category: 'COMPONENT' });
  }

  /**
   * Log route navigation
   */
  route(message: string, context?: Record<string, any>): void {
    this.info(message, { ...context, category: 'ROUTE' });
  }

  /**
   * Log form submissions
   */
  form(message: string, context?: Record<string, any>): void {
    this.info(message, { ...context, category: 'FORM' });
  }

  /**
   * Log validation errors
   */
  validation(message: string, context?: Record<string, any>): void {
    this.warn(message, { ...context, category: 'VALIDATION' });
  }

  /**
   * Log business logic events
   */
  business(message: string, context?: Record<string, any>): void {
    this.info(message, { ...context, category: 'BUSINESS' });
  }

  /**
   * Log error with context
   */
  errorWithContext(error: Error, context?: Record<string, any>): void {
    this.error(error.message, {
      ...context,
      errorName: error.name,
      errorStack: error.stack,
      category: 'ERROR'
    });
  }

  /**
   * Log performance timing
   */
  timing(label: string, startTime: number, endTime?: number): void {
    const duration = endTime ? endTime - startTime : Date.now() - startTime;
    this.performance(`${label} completed in ${duration}ms`, {
      duration,
      startTime,
      endTime,
      category: 'TIMING'
    });
  }

  /**
   * Log memory usage
   */
  memory(label: string, usage: number): void {
    this.performance(`Memory usage for ${label}: ${usage}MB`, {
      usage,
      category: 'MEMORY'
    });
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private getStackTrace(): string | undefined {
    if (!this.config.includeStackTrace) {
      return undefined;
    }

    try {
      throw new Error();
    } catch (error) {
      return error.stack;
    }
  }

  /**
   * Get current log buffer
   */
  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clearLogBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Get log statistics
   */
  getLogStats(): {
    const stats = {
      total: this.logBuffer.length,
      debug: this.logBuffer.filter(entry => entry.level === LogLevel.DEBUG).length,
      info: this.logBuffer.filter(entry => entry.level === LogLevel.INFO).length,
      warn: this.logBuffer.filter(entry => level === LogLevel.WARN).length,
      error: this.logBuffer.filter(entry => entry.level === LogLevel.ERROR).length,
      fatal: this.logBuffer.filter(entry => entry.level === LogLevel.FATAL).length,
    };

    return stats;
  }

  /**
   * Export logs to file (for debugging)
   */
  exportLogs(): string {
    return this.logBuffer.map(entry => this.formatter.format(entry)).join('\n');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial< LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set user ID for all subsequent logs
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Set session ID for all subsequent logs
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Set request ID for a specific operation
   */
  setRequestId(requestId: string): void {
    // This would typically be used in a request context
    // For now, we'll store it in a temporary variable
    (window as any).__requestId = requestId;
  }

  /**
   * Get current request ID
   */
  getRequestId(): string | undefined {
    return (window as any).__requestId;
  }

  /**
   * Clear request ID
   */
  clearRequestId(): void {
    delete (window as any).__requestId;
  }
}

// =============================================================================
// GLOBAL LOGGER INSTANCE
// =============================================================================

export const logger = new Logger();

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create a logger instance with custom configuration
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}

/**
 * Create a logger for a specific component
 */
export function createComponentLogger(componentName: string, config?: Partial<LoggerConfig>): Logger {
  const componentLogger = new Logger(config);
  
  // Override the log method to include component information
  const originalLog = componentLogger.log.bind(componentLogger);
  
  componentLogger.log = (entry: LogEntry) => {
    if (entry.component) {
      entry.component = componentName;
    }
    originalLog(entry);
  };

  return componentLogger;
}

/**
 * Create a logger for a specific category
 */
export function createCategoryLogger(category: string, config?: Partial<LoggerConfig>): Logger {
  const categoryLogger = new Logger(config);
  
  // Override the log method to include category information
  const originalLog = categoryLogger.log.bind(categoryLogger);
  
  categoryLogger.log = (entry: LogEntry) => {
    entry.category = category;
    originalLog(entry);
  };

  return categoryLogger;
}

// =============================================================================
// PERFORMANCE LOGGING
// =============================================================================

/**
 * Performance logger for measuring execution time
 */
export class PerformanceLogger {
  private timers: Map<string, number> = new Map();
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger || createLogger();
  }

  startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  endTimer(label: string): void {
    const startTime = this.timers.get(label);
    if (startTime) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.logger.timing(label, startTime, endTime);
      this.timers.delete(label);
    }
  }

  measure<T>(label: string, fn: () => T): T {
    this.startTimer(label);
    try {
      const result = fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }

  measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(label);
    try {
      const result = await fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Logger,
  LogLevel,
  createLogger,
  createComponentLogger,
  createCategoryLogger,
  PerformanceLogger,
  StructuredFormatter,
  SimpleFormatter,
  ColoredFormatter,
  JSONFormatter
};

export default logger;
