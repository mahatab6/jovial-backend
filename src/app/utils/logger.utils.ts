import logger from "../../config/logger";
import { authLogger, aiLogger, errorLogger } from "../../config/logger";

interface LogMeta {
  userId?: string;
  jobId?: string;
  requestId?: string;
  [key: string]: any;
}

/**
 * Utility for standardized, structured logging across the application.
 * Designed for production-grade observability and JSON-readability.
 */
export const LoggerUtils = {
  // Generic logger for ad-hoc messages
  info: (message: string, meta?: LogMeta) => {
    logger.info(message, meta);
  },

  // Auth Logs
  auth: {
    success: (userId: string, event: string, meta: LogMeta = {}) => {
      authLogger.info(`[Auth Success] ${event}`, { userId, ...meta });
    },
    failed: (reason: string, meta: LogMeta = {}) => {
      authLogger.warn(`[Auth Failed] ${reason}`, meta);
    },
  },

  // AI Logs with specific focus on performance and outcome
  ai: {
    info: (message: string, meta?: LogMeta) => {
      aiLogger.info(message, meta);
    },
    generation: (provider: string, model: string, userId: string, meta: LogMeta = {}) => {
      aiLogger.info(`[AI Generation] ${provider} (${model})`, { 
        userId, 
        provider, 
        model, 
        ...meta 
      });
    },
    // Tracking duration from start to end
    performance: (event: string, durationMs: number, meta: LogMeta = {}) => {
      aiLogger.info(`[AI Performance] ${event}`, { 
        durationMs, 
        ...meta 
      });
    },
    error: (provider: string, error: string, meta: LogMeta = {}) => {
      aiLogger.error(`[AI Error] ${provider}`, { 
        provider, 
        errorMessage: error, 
        ...meta 
      });
    },
  },

  // Business/System Logs
  business: {
    warn: (message: string, meta: LogMeta = {}) => {
      errorLogger.warn(`[Business Warning] ${message}`, meta);
    },
  },

  system: {
    error: (message: string, error?: any, meta: LogMeta = {}) => {
      errorLogger.error(`[System Error] ${message}`, { 
        ...meta,
        error: error?.message || error, 
        stack: error?.stack 
      });
    }
  }
};
