// src/config/queue.ts
import { Queue, Worker, QueueEvents } from "bullmq";
import Redis from "ioredis";
import { envVariable } from "./env";

export const redisConnection = new Redis({
    host: envVariable.REDIS_HOST,
    port: Number(envVariable.REDIS_PORT),
    password: envVariable.REDIS_PASSWORD,
    tls: {},
    maxRetriesPerRequest: null, // Required for BullMQ
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.slice(0, targetError.length) === targetError) {
            return true;
        }
        return false;
    },
});

// Redis Event Listeners
redisConnection.on("connect", () => {
    console.log("Successfully connected to Redis");
});

redisConnection.on("error", (err) => {
    console.error("Redis Connection Error:", err.message);
});

redisConnection.on("reconnecting", () => {
    console.log("Reconnecting to Redis...");
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