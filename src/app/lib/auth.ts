import "dotenv/config";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envVariable } from "../../config/env";

export const auth = betterAuth({
  baseUrl: envVariable.BETTER_AUTH_URL!,
  secret: envVariable.BETTER_AUTH_SECRET!,
  trustedOrigins: [
    "http://localhost:3000",
    envVariable.FRONTEND_URL,
    envVariable.BETTER_AUTH_URL,
  ],

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),


  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "UNBAN",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  autoSignIn: true,
  },
});
