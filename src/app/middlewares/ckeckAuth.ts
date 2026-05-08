

import { NextFunction, Request, Response } from "express";
import { UserRole } from "../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import { prisma } from "../lib/prisma";
import AppErrors from "../errorHandler/AppErrors";
import status from "http-status";


export const checkAuth =
  (...authRole: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session_token = cookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );

      let userData: any = null;

     
      if (!userData && session_token) {
        const sessionExists = await prisma.session.findFirst({
          where: {
            token: session_token,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            user: true,
          },
        });

        if (sessionExists?.user) {
          const { user } = sessionExists;
          userData = user;
        }
      }

      if (!userData) {
        throw new AppErrors(
          status.UNAUTHORIZED,
          "Authentication required. Please login.",
        );
      }

      if (
        authRole.length > 0 &&
        !authRole.includes(userData.role as UserRole)
      ) {
        throw new AppErrors(
          status.FORBIDDEN,
          "You do not have permission to perform this action.",
        );
      }

      req.user = {
        id: userData.userId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };