import { prisma } from "../../lib/prisma";
import { UserRole } from "../../generated/prisma/enums";
import AppErrors from "../../errorHandler/AppErrors";
import status from "http-status";
import { UserUtils } from "./user.utils";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interface/query.interface";
import { CacheUtils } from "../../utils/cache.utils";

class UserService {
  static async getMe(userId: string) {
    const cacheKey = `user:profile:${userId}`;
    const cachedUser = await CacheUtils.get(cacheKey);
    if (cachedUser) return cachedUser;

    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: {
        userPreference: true,
      },
    });

    if (!user) {
      throw new AppErrors(status.NOT_FOUND, "User not found");
    }

    const sanitizedUser = UserUtils.sanitizeUserResponse(user);
    await CacheUtils.set(cacheKey, sanitizedUser, 3600); // Cache for 1 hour

    return sanitizedUser;
  }

  static async updateMe(userId: string, data: any) {
    const { preferences, ...profileData } = data;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId, deletedAt: null },
        data: profileData,
      });

      if (preferences) {
        await tx.userPreference.upsert({
          where: { userId },
          create: {
            userId,
            ...preferences,
          },
          update: preferences,
        });
      }

      return user;
    });

    const sanitizedResult = UserUtils.sanitizeUserResponse(result);
    await CacheUtils.del(`user:profile:${userId}`); // Invalidate cache
    
    return sanitizedResult;
  }

  static async getAllUsers(queryParams: IQueryParams) {
    const userQuery = new QueryBuilder(prisma.user, queryParams, {
      searchableFields: ["name", "email"],
      filterableFields: ["role", "status"],
    })
      .search()
      .filter()
      .sort()
      .paginate()
      .where({ deletedAt: null });

    return await userQuery.execute();
  }

  static async getSingleUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { contents: true },
        },
      },
    });

    if (!user) {
      throw new AppErrors(status.NOT_FOUND, "User not found");
    }

    // Get usage stats summary
    const usage = await prisma.apiUsage.aggregate({
      where: { userId: id },
      _sum: { tokens: true },
    });

    const sanitizedUser = UserUtils.sanitizeUserResponse(user);

    return {
      ...sanitizedUser,
      stats: {
        contentCount: user._count.contents,
        totalTokens: usage._sum.tokens || 0,
      },
    };
  }

  static async updateRole(adminId: string, targetId: string, role: UserRole) {
    if (adminId === targetId) {
      throw new AppErrors(status.BAD_REQUEST, "Self-demotion is not allowed");
    }

    const user = await prisma.user.update({
      where: { id: targetId, deletedAt: null },
      data: { role },
    });

    return UserUtils.sanitizeUserResponse(user);
  }

  static async deleteUser(adminId: string, targetId: string) {
    if (adminId === targetId) {
      throw new AppErrors(status.BAD_REQUEST, "Self-deletion is not allowed");
    }

    // Check if super admin (this is a mock check, usually ID based)
    // For now, just prevent deleting if it's the last admin? No, let's keep it simple.

    await prisma.user.update({
      where: { id: targetId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return null;
  }
}

export default UserService;
