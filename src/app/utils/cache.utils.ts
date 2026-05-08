import { redisConnection } from "../../config/queue";

const DEFAULT_TTL = 3600; // 1 hour in seconds

/**
 * Redis Caching Utility
 */
export const CacheUtils = {
  /**
   * Set a value in cache
   */
  async set(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<void> {
    const stringValue = JSON.stringify(value);
    await redisConnection.set(key, stringValue, "EX", ttl);
  },

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const data = await redisConnection.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      return null;
    }
  },

  /**
   * Delete a value from cache
   */
  async del(key: string): Promise<void> {
    await redisConnection.del(key);
  },

  /**
   * Delete multiple keys by pattern
   */
  async delByPattern(pattern: string): Promise<void> {
    const keys = await redisConnection.keys(pattern);
    if (keys.length > 0) {
      await redisConnection.del(...keys);
    }
  },
};
