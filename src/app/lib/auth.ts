import "dotenv/config";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envVariable } from "../../config/env";
import { bearer } from "better-auth/plugins";
import { authLogger } from "../../config/logger";

export const auth = betterAuth({
  // BETTER_AUTH_URL must be the backend's own URL (e.g. Railway URL)
  // This is what Better Auth uses to construct the OAuth callback URL:
  // → https://<BETTER_AUTH_URL>/api/auth/callback/google
  baseUrl: envVariable.BETTER_AUTH_URL!,
  secret: envVariable.BETTER_AUTH_SECRET!,
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5000",
    envVariable.FRONTEND_URL,
    envVariable.BETTER_AUTH_URL, // backend URL itself
  ],

  logger: {
    level: "info",
    log: (level, message, ...args) => {
      const logMessage = `[Better-Auth] ${message}`;
      if (level === "error") {
        authLogger.error(logMessage, ...args);
      } else if (level === "warn") {
        authLogger.warn(logMessage, ...args);
      } else {
        authLogger.info(logMessage, ...args);
      }
    },
  },

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

  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    bearer(),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  cookies: {
    sessionToken: {
      attributes: {
        sameSite: "none",
        secure: true,
      }
    }
  },

  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: false,
    },
    disableCSRFCheck: true, // Allow requests without Origin header (Postman, mobile apps, etc.)
  },

});
