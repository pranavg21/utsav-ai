/**
 * @fileoverview Structured JSON logging utility for audit trails and cloud logging.
 * Formats events, warnings, and errors with ISO timestamps and contextual metadata.
 */

/** Supported severity levels for structured log emission. */
export type LogLevel = 'info' | 'warn' | 'error';

/** Standard payload format for cloud log ingestion. */
export interface LogEntry {
  /** Timestamp in ISO 8601 format. */
  readonly timestamp: string;
  /** Severity level. */
  readonly level: LogLevel;
  /** Primary log message. */
  readonly message: string;
  /** Optional contextual metadata object. */
  readonly context?: Record<string, unknown>;
}

/**
 * Serializes and emits a structured log entry to the browser console.
 *
 * @param level - Severity level.
 * @param message - Human-readable message.
 * @param context - Optional metadata payload.
 */
function emitLog(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ? { context } : {}),
  };

  const serialized = JSON.stringify(entry);

  if (level === 'error') {
    console.error(serialized);
  } else if (level === 'warn') {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }
}

/**
 * Structured logger instance offering typed level methods.
 */
export const logger = {
  info: (message: string, context?: Record<string, unknown>): void => {
    emitLog('info', message, context);
  },
  warn: (message: string, context?: Record<string, unknown>): void => {
    emitLog('warn', message, context);
  },
  error: (message: string, context?: Record<string, unknown>): void => {
    emitLog('error', message, context);
  },
} as const;
