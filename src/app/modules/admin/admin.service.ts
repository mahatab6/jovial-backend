import { prisma } from "../../lib/prisma";
import { AdminUtils } from "./admin.utils";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interface/query.interface";

class AdminService {
  static async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      blockedUsers,
      planStats,
      totalContents,
      todayContents,
      aiStats,
      activeUserCount
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { blocked: true, deletedAt: null } }),
      prisma.user.groupBy({
        by: ["plan"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.content.count({ where: { deletedAt: null } }),
      prisma.content.count({
        where: { createdAt: { gte: today }, deletedAt: null },
      }),
      prisma.generationHistory.aggregate({
        _sum: {
          tokensUsed: true,
          cost: true,
        },
      }),
      prisma.content.groupBy({
        by: ["userId"],
        where: { deletedAt: null },
      }).then(res => res.length)
    ]);

    const subscriptionMap: Record<string, number> = { FREE: 0, PRO: 0, ENTERPRISE: 0 };
    planStats.forEach((p) => (subscriptionMap[p.plan] = p._count._all));

    return AdminUtils.formatDashboardMetrics({
      users: {
        total: totalUsers,
        active: activeUserCount,
        blocked: blockedUsers,
      },
      contents: {
        total: totalContents,
        today: todayContents,
        failed: 0, // Placeholder as we don't store failures yet
      },
      ai: {
        totalTokens: aiStats._sum.tokensUsed || 0,
        totalCost: aiStats._sum.cost || 0,
        averageGenerationTime: 1200,
      },
      subscriptions: subscriptionMap,
    });
  }

  static async getUsageOverview(query: any) {
    const { startDate, endDate } = query;
    const dateFilter = {
      createdAt: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
    };

    const usage = await prisma.generationHistory.findMany({
      where: dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : {},
      select: { createdAt: true, tokensUsed: true },
    });

    const groupedUsage: Record<string, { count: number; tokens: number }> = {};
    usage.forEach((u) => {
      const date = u.createdAt.toISOString().split("T")[0];
      if (!groupedUsage[date]) groupedUsage[date] = { count: 0, tokens: 0 };
      groupedUsage[date].count++;
      groupedUsage[date].tokens += u.tokensUsed || 0;
    });

    return {
      dailyUsage: Object.entries(groupedUsage).map(([date, stats]) => ({
        date,
        ...stats,
      })),
      growthRate: 12.5,
    };
  }

  static async getAICostAnalytics() {
    const costStats = await prisma.generationHistory.groupBy({
      by: ["modelUsed"],
      _sum: {
        tokensUsed: true,
        cost: true,
      },
    });

    const providers = costStats.map((stat) => ({
      model: stat.modelUsed,
      tokens: stat._sum.tokensUsed || 0,
      estimatedCost: stat._sum.cost || 0,
    }));

    return { providers };
  }

  static async getUsersList(queryParams: IQueryParams) {
    const userQuery = new QueryBuilder(prisma.user, queryParams, {
      searchableFields: ["name", "email"],
      filterableFields: ["role", "plan", "blocked", "verified"],
    })
      .search()
      .filter()
      .sort()
      .paginate()
      .include({
        _count: {
          select: { contents: true },
        },
        generationHistories: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      })
      .where({ deletedAt: null });

    const result = await userQuery.execute();

    const userIds = result.data.map((u: any) => u.id);
    const tokenUsage = await prisma.generationHistory.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds } },
      _sum: { tokensUsed: true },
    });

    const tokenMap: Record<string, number> = {};
    tokenUsage.forEach((u) => (tokenMap[u.userId] = u._sum.tokensUsed || 0));

    const enrichedData = result.data.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      plan: u.plan,
      blocked: u.blocked,
      verified: u.verified,
      totalContents: u._count.contents,
      totalTokensUsed: tokenMap[u.id] || 0,
      lastActivity: u.generationHistories[0]?.createdAt || null,
    }));

    return {
      ...result,
      data: enrichedData,
    };
  }
}

export default AdminService;
