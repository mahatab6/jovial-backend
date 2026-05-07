import dotenv from "dotenv";
import status from "http-status";
import AppErrors from "../app/errorHandler/AppErrors";

dotenv.config();

interface EnvConfig {
    DATABASE_URL: string;
    PORT: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requireEnvVariables = [ 
    "DATABASE_URL",
    "PORT"
  ];

  requireEnvVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppErrors(
        status.INTERNAL_SERVER_ERROR,
        `Environment veriable ${variable} is require but it not set`,
      );
    }
  });


    return {
        DATABASE_URL: process.env.DATABASE_URL as string,
        PORT: process.env.PORT as string,
    };
};


export const envVariable = loadEnvVariables();