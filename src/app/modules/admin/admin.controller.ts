import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { sendResponse } from "../../share/sendResponse";
import status from "http-status";
import AdminService from "./admin.service";

const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getDashboardStats();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin dashboard stats retrieved successfully",
    data: result,
  });
});

const getUsageOverview = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getUsageOverview(req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Usage overview retrieved successfully",
    data: result,
  });
});

const getAICostAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getAICostAnalytics();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "AI cost analytics retrieved successfully",
    data: result,
  });
});

const getUsersList = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getUsersList(req.query as any);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin users list retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});


export const AdminController = {
  getDashboardStats,
  getUsageOverview,
  getAICostAnalytics,
  getUsersList,
};
