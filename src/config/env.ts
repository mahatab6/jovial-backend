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
}

const loadEnvVariables = (): EnvConfig => {
  const requireEnvVariables = [
    "DATABASE_URL",
    "PORT",
    "FRONTEND_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
  ];

  requireEnvVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `Environment variable ${variable} is required but it is not set`,
      );
    }
  });


  return {
    DATABASE_URL: process.env.DATABASE_URL as string,
    PORT: process.env.PORT as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
  };
};

export const envVariable = loadEnvVariables();
