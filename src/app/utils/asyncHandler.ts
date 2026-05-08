import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wraps an async function to catch any errors and pass them to the next middleware.
 */
const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;
