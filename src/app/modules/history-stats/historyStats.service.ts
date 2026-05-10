import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interface/query.interface";
import { UserRole } from "../../generated/prisma/enums";
import { HistoryStatsUtils } from "./historyStats.utils";

class HistoryStatsService {
  /*
  =========================
  HISTORY METHODS
  =========================
  */

  static async getPersonalHistory(userId: string, queryParams: IQueryParams) {
    const contentQuery = new QueryBuilder(prisma.content, queryParams, {
      searchableFields: ["title", "prompt"],
      filterableFields: ["type", "metadata.provider"],
    })
      .search()
      .filter()
      .sort()
      .paginate()
      .where({ userId, deletedAt: null });

    if (queryParams.startDate || queryParams.endDate) {
      contentQuery.where({
        createdAt: {
          gte: queryParams.startDate ? new Date(queryParams.startDate as string) : undefined,
          lte: queryParams.endDate ? new Date(queryParams.endDate as string) : undefined,
        },
      });
    }

    return await contentQuery.execute();
  }

  static async getTeamHistory(managerId: string, queryParams: IQueryParams, userRole: string) {
    let whereCondition: any = { deletedAt: null };

    if (userRole === UserRole.MANAGER) {
      const teamMembers = await prisma.user.findMany({
        where: { managerId },
        select: { id: true },
      });
      const memberIds = teamMembers.map((m) => m.id);
      whereCondition.userId = { in: memberIds };
    }

    const contentQuery = new QueryBuilder(prisma.content, queryParams, {
      searchableFields: ["title", "prompt", "user.email"],
      filterableFields: ["type", "userId"],
    })
      .search()
      .filter()
      .sort()
      .paginate()
      .include({ user: { select: { name: true, email: true, image: true } } })
      .where(whereCondition);

    return await contentQuery.execute();
  }

  static async getAllHistory(queryParams: IQueryParams) {
    const contentQuery = new QueryBuilder(prisma.content, queryParams, {
      searchableFields: ["title", "prompt", "user.email"],
      filterableFields: ["type", "userId"],
    })
      .search()
      .filter()
      .sort()
      .paginate()
      .include({ user: { select: { name: true, email: true } } })
      .where({ deletedAt: null });

    return await contentQuery.execute();
  }

  /*
  =========================
  STATS METHODS
  =========================
  */

  static async getPersonalUsageStats(userId: string, query: any) {
    const { startDate, endDate } = query;
    const dateFilter = {
      createdAt: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
    };

    const [contentStats, apiUsageStats] = await Promise.all([
      prisma.content.aggregate({
        where: { userId, deletedAt: null, ...dateFilter },
        _count: { id: true },
      }),
      prisma.apiUsage.aggregate({
        where: { userId, ...(startDate || endDate ? { date: dateFilter.createdAt } : {}) },
        _sum: { tokens: true },
      }),
    ]);

    // Mocking success rate and average time as they aren't explicitly tracked yet
    const totalContents = (contentStats._count as any).id || (contentStats._count as any)._all;

    const totalTokens = apiUsageStats._sum.tokens || 0;

    // Daily usage trend
    const contents = await prisma.content.findMany({
      where: { userId, deletedAt: null, ...dateFilter },
      select: { createdAt: true },
    });

    return HistoryStatsUtils.normalizeStats({
      totalContents,
      totalTokens,
      successRate: 100, // Placeholder
      averageGenerationTime: 1500, // Placeholder ms
      dailyUsage: HistoryStatsUtils.groupDataByDate(contents),
    });
  }

  static async getTeamAnalytics(managerId: string, query: any, userRole: string) {
    let memberIds: string[] = [];

    if (userRole === UserRole.MANAGER) {
      const teamMembers = await prisma.user.findMany({
        where: { managerId },
        select: { id: true },
      });
      memberIds = teamMembers.map((m) => m.id);
    } else {
      // Admin might want a specific team or all teams
      const allUsers = await prisma.user.findMany({ select: { id: true } });
      memberIds = allUsers.map((u) => u.id);
    }

    const [contentStats, tokenStats, topUsers] = await Promise.all([
      prisma.content.count({
        where: { userId: { in: memberIds }, deletedAt: null },
      }),
      prisma.apiUsage.aggregate({
        where: { userId: { in: memberIds } },
        _sum: { tokens: true },
      }),
      prisma.content.groupBy({
        by: ["userId"],
        where: { userId: { in: memberIds }, deletedAt: null },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
    ]);

    return {
      totalContents: contentStats,
      totalTokens: tokenStats._sum.tokens || 0,
      topUsers,
    };
  }

  static async getGlobalAnalytics() {
    const [totalUsers, totalContents, providerUsage] = await Promise.all([
      prisma.user.count(),
      prisma.content.count({ where: { deletedAt: null } }),
      prisma.content.groupBy({
        by: ["type"],
        _count: { _all: true },
      }),
    ]);

    return {
      totalUsers,
      totalContents,
      providerUsage,
    };
  }

  static async getContentTypeDistribution(userId: string, role: string) {
    const where: any = { deletedAt: null };
    if (role === UserRole.USER) where.userId = userId;

    const distribution = await prisma.content.groupBy({
      by: ["type"],
      where,
      _count: { _all: true },
    });

    return distribution.map((item) => ({
      type: item.type,
      count: (item._count as any).id || (item._count as any)._all,
    }));
  }

  static async getModelUsageAnalytics(userId: string, role: string) {
    const where: any = { deletedAt: null };
    if (role === UserRole.USER) where.userId = userId;

    const contents = await prisma.content.findMany({
      where,
      select: { metadata: true },
    });

    const modelCounts: Record<string, number> = {};
    contents.forEach((c) => {
      const meta = c.metadata as any;
      const model = meta?.provider || "unknown";
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    });

    return Object.entries(modelCounts).map(([provider, count]) => ({
      provider,
      count,
    }));
  }
}

export default HistoryStatsService;
