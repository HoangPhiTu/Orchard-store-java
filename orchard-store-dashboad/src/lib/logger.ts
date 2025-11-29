/**
 * Logger Utility
 *
 * Centralized logging that only logs in development mode.
 * In production, logs are suppressed to improve performance and security.
 */

const isDev = process.env.NODE_ENV === "development";

type LogLevel = "log" | "info" | "warn" | "error" | "debug";

interface Logger {
  log: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

/**
 * Create a logger instance with optional prefix
 */
const createLogger = (prefix?: string): Logger => {
  const formatMessage = (level: LogLevel, args: unknown[]): unknown[] => {
    if (prefix) {
      return [`[${prefix}]`, ...args];
    }
    return args;
  };

  return {
    log: (...args: unknown[]) => {
      if (isDev) {
        console.log(...formatMessage("log", args));
      }
    },
    info: (...args: unknown[]) => {
      if (isDev) {
        console.info(...formatMessage("info", args));
      }
    },
    warn: (...args: unknown[]) => {
      if (isDev) {
        console.warn(...formatMessage("warn", args));
      }
      // In production, warnings might be sent to error tracking service
    },
    error: (...args: unknown[]) => {
      // Always log errors, even in production (but can be sent to error tracking)
      console.error(...formatMessage("error", args));
      // TODO: Send to error tracking service (e.g., Sentry) in production
    },
    debug: (...args: unknown[]) => {
      if (isDev) {
        console.debug(...formatMessage("debug", args));
      }
    },
  };
};

/**
 * Default logger instance
 */
export const logger = createLogger();

/**
 * Create a logger with a specific prefix
 * @example
 * const userLogger = createLoggerWithPrefix('UserService');
 * userLogger.log('User created'); // [UserService] User created
 */
export const createLoggerWithPrefix = (prefix: string): Logger => {
  return createLogger(prefix);
};

export default logger;
