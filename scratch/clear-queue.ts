import { Queue } from "bullmq";
import { redisConnection } from "../src/config/queue";

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
    }
}

clearQueue();
