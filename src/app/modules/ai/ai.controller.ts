// src/controllers/ai.controller.ts
import { Request, Response } from "express";
import { catchAsync } from "../../share/catchAsync";
import { sendResponse } from "../../share/sendResponse";
import status from "http-status";
import { ContentType } from "../../generated/prisma/enums";
import AIService, { GenerateContentInput } from "./ai.service";


const generateContent = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

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

  const result = await AIService.generateContent(userId, input);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Content generated successfully",
    data: result.content,
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