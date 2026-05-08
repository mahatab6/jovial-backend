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
    // meta: {
    //   historyId: result.history.id,
    //   aiResponse: result.aiResponse,
    // },
  });
});

export const AiController = {
  generateContent,
};