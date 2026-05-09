// src/config/logger.ts
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { envVariable } from "./env";

const logDir = path.join(process.cwd(), "logs");

const logFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
);

// Console format 
const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: "HH:mm:ss" }),
    format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
);

// Main Application Logger (Requests, Debug, etc.)
const logger = createLogger({
    level: envVariable.NODE_ENV === "production" ? "info" : "debug",
    format: logFormat,
    defaultMeta: { service: "jovial-ai-backend" },
    transports: [
        new transports.Console({
            format: consoleFormat,
        }),
        new DailyRotateFile({
            filename: path.join(logDir, "app-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
        }),
    ],
});

// Auth Events Logger
export const authLogger = createLogger({
    level: "info",
    format: logFormat,
    transports: [
        new DailyRotateFile({
            filename: path.join(logDir, "auth-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxFiles: "30d",
        }),
        new transports.Console({
            format: consoleFormat,
        }),
    ],
});

// AI Usage Logger
export const aiLogger = createLogger({
    level: "info",
    format: logFormat,
    transports: [
        new DailyRotateFile({
            filename: path.join(logDir, "ai-usage-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxFiles: "30d",
        }),
        new transports.Console({
            format: consoleFormat,
        }),
    ],
});

// Error Logger (System and Business Errors)
export const errorLogger = createLogger({
    level: "warn",
    format: logFormat,
    transports: [
        new DailyRotateFile({
            filename: path.join(logDir, "error-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
        }),
        new transports.Console({
            format: consoleFormat,
        }),
    ],
});

export default logger;
