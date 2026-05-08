// src/app/middlewares/logger.middleware.ts
import { Request, Response, NextFunction } from "express";
import logger from "../../config/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        const message = `[Request] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;

        logger.info(message, {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userId: (req as any).user?.id || "guest",
            userAgent: req.get("user-agent"),
        });
    });

    next();
};