// src/workers/ai.worker.ts
import { Worker, Job } from "bullmq";
import { redisConnection } from "../../config/queue";
import { aiLogger } from "../../config/logger";
import AIService from "../modules/ai/ai.service";

const worker = new Worker(
    "ai-generation",
    async (job: Job) => {
        const { userId, input } = job.data;

        aiLogger.info("AI Worker Processing Job", { 
            jobId: job.id, 
            userId, 
            type: input.type,
            promptLength: input.prompt.length 
        });

        try {
            // Initial progress
            await job.updateProgress(10);
            
            const result = await AIService.generateContent(userId, input);

            // Job Completed
            await job.updateProgress(100);

            aiLogger.info("AI Worker Completed Job Successfully", { 
                jobId: job.id, 
                userId, 
                contentId: result.content.id 
            });

            // Return full data for the job status API
            return {
                success: true,
                status: "completed",
                contentId: result.content.id,
                title: result.content.title,
                content: result.content.content,
                metadata: result.content.metadata,
                timestamps: {
                    completedAt: new Date().toISOString(),
                }
            };
        } catch (error: any) {
            aiLogger.error("AI Worker Job Failed", { 
                jobId: job.id, 
                userId, 
                error: error.message,
                stack: error.stack 
            });
            
            // Re-throw to mark job as failed in BullMQ
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