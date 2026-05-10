import dotenv from "dotenv";
import status from "http-status";
import AppError from "../app/errors/AppError";

dotenv.config();

interface EnvConfig {
  DATABASE_URL: string;
  PORT: string;
  FRONTEND_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_PASSWORD?: string;
  NODE_ENV: string;
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requireEnvVariables = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "FRONTEND_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GEMINI_API_KEY",
  ];

  const missingVariables: string[] = [];
  requireEnvVariables.forEach((variable) => {
    if (!process.env[variable]) {
      missingVariables.push(variable);
    }
  });

  if (missingVariables.length > 0) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      `Missing required environment variables: ${missingVariables.join(", ")}`,
    );
  }


  return {
    DATABASE_URL: process.env.DATABASE_URL as string,
    PORT: process.env.PORT || "5000",
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
    REDIS_PORT: process.env.REDIS_PORT || "6379",
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    NODE_ENV: process.env.NODE_ENV || "development",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY as string,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  };
};

export const envVariable = loadEnvVariables();
