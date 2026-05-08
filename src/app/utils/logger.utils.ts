import logger from "../../config/logger";
import { authLogger } from "../../config/logger";
import { aiLogger } from "../../config/logger";
import { errorLogger } from "../../config/logger";

/**
 * Utility for standardized logging across the application
 */
export const LoggerUtils = {
  // Auth Logs
  auth: {
    success: (userId: string, event: string, meta?: any) => {
      authLogger.info(`[Auth Success] User ${userId}: ${event}`, meta);
    },
    failed: (reason: string, meta?: any) => {
      authLogger.warn(`[Auth Failed] ${reason}`, meta);
    },
  },

  // AI Logs
  ai: {
    generation: (provider: string, model: string, userId: string, meta?: any) => {
      aiLogger.info(`[AI Generation] ${provider} (${model}) by user ${userId}`, meta);
    },
    error: (provider: string, error: string, meta?: any) => {
      aiLogger.error(`[AI Error] ${provider}: ${error}`, meta);
    },
  },

  // Business/System Logs
  business: {
    warn: (message: string, meta?: any) => {
      errorLogger.warn(`[Business Warning] ${message}`, meta);
    },
  },

  system: {
    error: (message: string, error?: any) => {
      errorLogger.error(`[System Error] ${message}`, { error: error?.message || error, stack: error?.stack });
    }
  }
};
