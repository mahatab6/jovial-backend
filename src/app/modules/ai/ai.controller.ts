// src/controllers/ai.controller.ts
import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";

import { sendResponse } from "../../share/sendResponse";
import status from "http-status";
import { ContentType } from "../../generated/prisma/enums";
import AIService, { GenerateContentInput } from "./ai.service";
import { aiGenerationQueue } from "../../../config/queue";
import { UserRole } from "../../generated/prisma/enums";
import { LoggerUtils } from "../../utils/logger.utils";


const generateContent = asyncHandler(async (req: Request, res: Response) => {
  
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    throw new Error("User not found");
  }

  const { prompt, type, tone, length, keywords, model } = req.body;

  const input: GenerateContentInput = {
    prompt,
    type: type as ContentType,
    tone,
    length,
    keywords,
    model,
  };

  // Determine priority based on role
  let priority = 3; // Default for USER
  if (userRole === UserRole.ADMIN) priority = 1;
  else if (userRole === UserRole.MANAGER) priority = 2;

  // Add to Job Queue
  const job = await aiGenerationQueue.add(
    "generate-content",
    {
      userId,
      input,
      requestedAt: new Date()
    },
    {
      priority,
      removeOnComplete: {
        age: 3600, // Keep for 1 hour so frontend can fetch result
        count: 1000, // Keep last 1000 jobs
      },
      removeOnFail: {
        age: 24 * 3600, // Keep failed jobs for 24 hours for debugging
      },
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      }
    }
  );
 
  LoggerUtils.ai.generation("openai", "ai-generation", userId, { jobId: job.id, type });

  sendResponse(res, {
    httpStatusCode: status.ACCEPTED,
    success: true,
    message: "AI generation started. Processing in background...",
    data: {
      jobId: job.id,
      status: "queued",
      priority: priority === 1 ? "high" : priority === 2 ? "medium" : "normal"
    }
  });
});

const getJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  
  // Single Redis call to fetch job data
  const job = await aiGenerationQueue.getJob(jobId as string);

  if (!job) {
    return sendResponse(res, {
      httpStatusCode: status.NOT_FOUND,
      success: false,
      message: "Job not found in queue. It may have expired or been removed.",
    });
  }

  // Batch Redis calls for state and progress
  const [state, progress] = await Promise.all([
    job.getState(),
    job.progress
  ]);

  const result = job.returnvalue || {};
  const isFailed = state === "failed";
  const isCompleted = state === "completed";

  // Map BullMQ states to simplified frontend-friendly statuses
  let simplifiedStatus: 'waiting' | 'active' | 'completed' | 'failed' = 'waiting';
  if (state === 'completed') simplifiedStatus = 'completed';
  else if (state === 'failed') simplifiedStatus = 'failed';
  else if (state === 'active') simplifiedStatus = 'active';
  else simplifiedStatus = 'waiting'; // prioritized, waiting, delayed, paused -> waiting

  // Normalize response structure
  const responseData = {
    jobId: job.id,
    status: simplifiedStatus, 
    rawStatus: state,
    progress: typeof progress === 'number' ? progress : (isCompleted ? 100 : 0),
    content: result.content || null,
    title: result.title || null,
    contentId: result.contentId || null,
    metadata: result.metadata || null,
    error: isFailed ? (job.failedReason || result.failedReason || "Unknown error occurred during processing") : null,
    timestamps: {
      queuedAt: job.timestamp ? new Date(job.timestamp).toISOString() : null,
      processedAt: job.processedOn ? new Date(job.processedOn).toISOString() : null,
      finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
    }
  };

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: `Job state: ${state}`,
    data: responseData
  });
});


const generateBulk = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { items } = req.body;

  const result = await AIService.generateBulkContent(userId!, items);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Bulk content generation completed",
    data: result,
  });
});

const regenerate = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const { id } = req.params;

  const result = await AIService.regenerateContent(userId!, id as string, userRole!);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Content regenerated successfully",
    data: result,
  });
});

const getMyContents = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await AIService.getMyContents(userId!, req.query as any);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Contents retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const searchContents = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await AIService.searchContents(userId!, req.query as any);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Search results retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleContent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const { id } = req.params;

  const result = await AIService.getSingleContent(userId!, id as string, userRole!);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Content retrieved successfully",
    data: result,
  });
});

const updateContent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const result = await AIService.updateContent(userId!, id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Content updated successfully",
    data: result,
  });
});

const deleteContent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const { id } = req.params;

  await AIService.deleteContent(userId!, id as string, userRole!);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Content deleted successfully",
    data: null,
  });
});

const getTeamContents = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await AIService.getTeamContents(userId!, req.query as any);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Team contents retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAllContents = asyncHandler(async (req: Request, res: Response) => {
  const result = await AIService.getAllContents(req.query as any);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All contents retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const AiController = {
  generateContent,
  getJobStatus,
  generateBulk,
  regenerate,
  getMyContents,
  searchContents,
  getSingleContent,
  updateContent,
  deleteContent,
  getTeamContents,
  getAllContents,
};