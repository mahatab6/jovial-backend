import { Request, Response } from "express";
import { catchAsync } from "../../share/catchAsync";
import { sendResponse } from "../../share/sendResponse";
import status from "http-status";
import UserService from "./user.service";

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await UserService.getMe(userId!);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await UserService.updateMe(userId!, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query as any);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getSingleUser(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User details retrieved successfully",
    data: result,
  });
});

const updateRole = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user?.id;
  const { id } = req.params;
  const { role } = req.body;

  const result = await UserService.updateRole(adminId!, id as string, role);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User role updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user?.id;
  const { id } = req.params;

  await UserService.deleteUser(adminId!, id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User deleted successfully",
    data: null,
  });
});

export const UserController = {
  getMe,
  updateMe,
  getAllUsers,
  getSingleUser,
  updateRole,
  deleteUser,
};
