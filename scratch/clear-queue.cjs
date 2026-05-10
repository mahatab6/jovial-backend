const { Queue } = require("bullmq");
const Redis = require("ioredis");

// Manually define connection to avoid import issues
const redisConnection = new Redis({
    host: "star-amoeba-119291.upstash.io",
    port: 6379,
    password: "gQAAAAAAAdH7AAIgcDFkOTU1NmZlZmY0MmQ0NzdkYjhmMTE2MTEzYjZmMGRkMw",
    maxRetriesPerRequest: null,
});

async function clearQueue() {
    console.log("🚀 Clearing AI Generation Queue...");
    const aiGenerationQueue = new Queue("ai-generation", { connection: redisConnection });

    try {
        await aiGenerationQueue.drain();
        await aiGenerationQueue.clean(0, 1000, "completed");
        await aiGenerationQueue.clean(0, 1000, "failed");
        await aiGenerationQueue.clean(0, 1000, "active");
        await aiGenerationQueue.clean(0, 1000, "wait");
        
        console.log("✅ Queue cleared successfully.");
    } catch (error) {
        console.error("❌ Failed to clear queue:", error);
    } finally {
        await aiGenerationQueue.close();
        process.exit(0);
    }
}

clearQueue();
