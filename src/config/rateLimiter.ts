// src/config/rateLimiter.ts
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { Request, Response } from "express";

// Custom key generator (User ID + IP)
const userAwareKeyGenerator = (req: Request): string => {
    const userId = (req as any).user?.id || ipKeyGenerator(req.ip || "", 56);
    return `${userId}:${req.originalUrl}`;
};

// Auth Rate Limiter (Brute Force Protection)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            message: "Too many login attempts. Please try again after 15 minutes.",
            limit: 10,
            window: "15 minutes"
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip || "", 56),
});


// Hourly AI Generation Limit
export const aiGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: (req) => {
        const role = (req as any).user?.role;
        if (role === "ADMIN") return 10000; // Virtually unlimited
        if (role === "MANAGER") return 40;
        return 15; // Default USER
    },
    handler: (req: Request, res: Response) => {
        const role = (req as any).user?.role;
        const limit = role === "MANAGER" ? 40 : 15;
        res.status(429).json({
            success: false,
            message: "AI generation hourly limit reached",
            limit,
            window: "1 hour"
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userAwareKeyGenerator,
});

// Daily AI Limit
export const dailyAiLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: (req) => {
        const role = (req as any).user?.role;
        if (role === "ADMIN") return 100000; // Virtually unlimited
        if (role === "MANAGER") return 200;
        return 80; // Default USER
    },
    handler: (req: Request, res: Response) => {
        const role = (req as any).user?.role;
        const limit = role === "MANAGER" ? 200 : 80;
        res.status(429).json({
            success: false,
            message: "Daily AI generation limit reached",
            limit,
            window: "24 hours"
        });
    },
    keyGenerator: userAwareKeyGenerator,
});

// General API Limiter
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: {
        success: false,
        message: "Too many requests, please slow down.",
    },
});
