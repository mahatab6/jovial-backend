import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendResponse } from "../../share/sendResponse";
import status from "http-status";
import HistoryStatsService from "./historyStats.service";

const getPersonalHistory = asyncHandler(async (req: Request, res: Response) => {

  const userId = req.user?.id;
  const result = await HistoryStatsService.getPersonalHistory(userId!, req.query as any);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Personal history retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getTeamHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const result = await HistoryStatsService.getTeamHistory(userId!, req.query as any, userRole!);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Team history retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAllHistory = asyncHandler(async (req: Request, res: Response) => {
  const result = await HistoryStatsService.getAllHistory(req.query as any);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All history retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getPersonalUsageStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await HistoryStatsService.getPersonalUsageStats(userId!, req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Personal usage stats retrieved successfully",
    data: result,
  });
});

const getTeamAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const result = await HistoryStatsService.getTeamAnalytics(userId!, req.query, userRole!);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Team analytics retrieved successfully",
    data: result,
  });
});

const getGlobalAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const result = await HistoryStatsService.getGlobalAnalytics();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Global analytics retrieved successfully",
    data: result,
  });
});

const getContentTypeDistribution = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const result = await HistoryStatsService.getContentTypeDistribution(userId!, userRole!);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Content type distribution retrieved successfully",
    data: result,
  });
});

const getModelUsageAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const result = await HistoryStatsService.getModelUsageAnalytics(userId!, userRole!);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Model usage analytics retrieved successfully",
    data: result,
  });
});

export const HistoryStatsController = {
  getPersonalHistory,
  getTeamHistory,
  getAllHistory,
  getPersonalUsageStats,
  getTeamAnalytics,
  getGlobalAnalytics,
  getContentTypeDistribution,
  getModelUsageAnalytics,
};
