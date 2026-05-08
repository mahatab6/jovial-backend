

import { NextFunction, Request, Response } from "express";
import { UserRole } from "../generated/prisma/enums";
import AppError from "../errors/AppError";
import status from "http-status";
import { auth } from "../lib/auth";


export const checkAuth =
  (...authRole: UserRole[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        let userData: any = null;
        const session = await auth.api.getSession({
          headers: new Headers(req.headers as any),
        });

        if (session) {
          userData = session.user;
        }

        if (!userData) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Authentication required. Please login.",
          );
        }

        if (
          authRole.length > 0 &&
          !authRole.includes(userData.role as UserRole)
        ) {
          throw new AppError(
            status.FORBIDDEN,
            "You do not have permission to perform this action.",
          );
        }

        req.user = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        };

        next();
      } catch (error) {
        next(error);
      }
    };