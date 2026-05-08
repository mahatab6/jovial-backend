import { Request, Response } from "express";
import { catchAsync } from "../../share/catchAsync";
import { sendResponse } from "../../share/sendResponse";
import status from "http-status";
import { AiService } from "./ai.service";


const generateContent = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await AiService.generateContent(query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Boats fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});


export const AiController = {
  generateContent,

};