// src/controllers/ai.controller.ts
import { Request, Response } from "express";
import { catchAsync } from "../../share/catchAsync";
import { sendResponse } from "../../share/sendResponse";
import status from "http-status";
import { ContentType } from "../../generated/prisma/enums";
import AIService, { GenerateContentInput } from "./ai.service";
import { aiGenerationQueue } from "../../../config/queue";
import { UserRole } from "../../generated/prisma/enums";


const generateContent = catchAsync(async (req: Request, res: Response) => {
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
      removeOnComplete: true,
    }
  );

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

const getJobStatus = catchAsync(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = await aiGenerationQueue.getJob(jobId as string);

  if (!job) {
    return sendResponse(res, {
      httpStatusCode: status.NOT_FOUND,
      success: false,
      message: "Job not found",
    });
  }

  const state = await job.getState();
  const progress = job.progress;
  const result = job.returnvalue;

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: `Job is currently ${state}`,
    data: {
      id: job.id,
      state,
      progress,
      result: state === "completed" ? result : null,
      failedReason: state === "failed" ? job.failedReason : null
    }
  });
});


const generateBulk = catchAsync(async (req: Request, res: Response) => {
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

const regenerate = catchAsync(async (req: Request, res: Response) => {
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

const getMyContents = catchAsync(async (req: Request, res: Response) => {
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

const searchContents = catchAsync(async (req: Request, res: Response) => {
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

const getSingleContent = catchAsync(async (req: Request, res: Response) => {
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

const updateContent = catchAsync(async (req: Request, res: Response) => {
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

const deleteContent = catchAsync(async (req: Request, res: Response) => {
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

const getTeamContents = catchAsync(async (req: Request, res: Response) => {
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

const getAllContents = catchAsync(async (req: Request, res: Response) => {
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