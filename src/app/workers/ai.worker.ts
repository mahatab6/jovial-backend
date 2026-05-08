// src/workers/ai.worker.ts
import { Worker, Job } from "bullmq";
import { redisConnection } from "../../config/queue";
import { aiLogger } from "../../config/logger";
import AIService from "../modules/ai/ai.service";

const worker = new Worker(
    "ai-generation",
    async (job: Job) => {
        const { userId, input, jobId } = job.data;

        console.log(`🔄 Processing AI Job ${job.id} for user ${userId}`);

        try {
            const result = await AIService.generateContent(userId, input);

            // Job Completed
            await job.updateProgress(100);

            return {
                success: true,
                contentId: result.content.id,
                title: result.content.title,
            };
        } catch (error: any) {
            aiLogger.error("AI Worker Failed", { jobId: job.id, userId, error: error.message });
            throw error;
        }
    },
    { connection: redisConnection, concurrency: 3 } // একসাথে ৩টা জব প্রসেস করবে
);

worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});