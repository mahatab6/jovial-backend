import { Response } from "express";

interface mata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface IResponse<T> {
  httpStatusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: mata
}

export const sendResponse = <T>(res: Response, responseData: IResponse<T>) => {
  const { httpStatusCode, success, message, data, meta } = responseData;

  res.status(httpStatusCode).json({
    success,
    message,
    data,
    meta,
  });
};