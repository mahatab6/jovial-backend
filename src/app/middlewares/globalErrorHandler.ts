import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { errorLogger } from "../../config/logger";
import AppErrors from "../errorHandler/AppErrors";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Something went wrong!";
  let errorMessages: any[] = [];

  if (err instanceof AppErrors) {
    statusCode = err.statusCode;
    message = err.message;
    errorMessages = err.message ? [{ path: "", message: err.message }] : [];

    // Business Errors (4xx) are logged as warnings
    if (statusCode < 500) {
      errorLogger.warn(`Business Error: ${message}`, {
        statusCode,
        path: req.originalUrl,
        method: req.method,
        userId: (req as any).user?.id || "guest",
      });
    } else {
      // System Errors (5xx) are logged as errors
      errorLogger.error(`System Error: ${message}`, {
        statusCode,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
      });
    }
  } else if (err instanceof Error) {
    message = err.message;
    errorMessages = err.message ? [{ path: "", message: err.message }] : [];

    errorLogger.error(`Unhandled Error: ${message}`, {
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: process.env.NODE_ENV === "development" ? err?.stack : null,
  });
};
