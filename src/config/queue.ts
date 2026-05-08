// src/config/queue.ts
import { Queue, Worker, QueueEvents } from "bullmq";
import Redis from "ioredis";

export const redisConnection = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});

// Main AI Generation Queue
export const aiGenerationQueue = new Queue("ai-generation", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { age: 24 * 3600 },
        removeOnFail: { age: 7 * 24 * 3600 },
    },
});

export const queueEvents = new QueueEvents("ai-generation", {
    connection: redisConnection,
});