import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { ContentType, UserRole } from "../../generated/prisma/enums";
import status from "http-status";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interface/query.interface";
import { LoggerUtils } from "../../utils/logger.utils";
import { CacheUtils } from "../../utils/cache.utils";
import { getAIProvider } from "./providers";

export type GenerateContentInput = {
  prompt: string;
  type: ContentType;
  tone?: string;
  length?: "short" | "medium" | "long";
  keywords?: string[];
  model?: string;
};

class AIService {
  private static getProvider() {
    return process.env.AI_PROVIDER?.toLowerCase() || "openai";
  }


  static async generateContent(userId: string, input: GenerateContentInput) {
    const {
      prompt,
      type,
      tone = "professional",
      length = "medium",
      keywords = [],
      model,
    } = input;

    let provider = this.getProvider();
    if (model) {
      if (model.startsWith("gpt") || model.startsWith("o1")) provider = "openai";
      if (model.startsWith("gemini")) provider = "gemini";
    }

    const defaultModel = provider === "openai" ? "gpt-4o-mini" : "gemini-1.5-flash";

    const systemPrompt = `You are a professional content writer. Respond ONLY with valid JSON using these exact keys:
{
  "title": string,
  "content": string,
  "seoScore": number (70-98),
  "keywords": string[],
  "readingTime": number,
  "summary": string
}`;

    const userPrompt = `
Type: ${type}
Tone: ${tone}
Length: ${length}
Keywords: ${keywords.join(", ") || "N/A"}
Prompt: ${prompt}
`;

    let aiResponse: any;

    try {
      const aiProvider = getAIProvider(provider);
      aiResponse = await aiProvider.generateContent(systemPrompt, userPrompt, model || defaultModel);
    } catch (error: any) {
      LoggerUtils.ai.error(provider, error.message, { userId, model: model || defaultModel });
      throw new AppError(
        status.BAD_GATEWAY,
        `${provider.toUpperCase()} Error: ${error.message}`
      );
    }

    // AI Generation Log
    LoggerUtils.ai.generation(provider, model || defaultModel, userId, {
      type,
      tone,
      promptLength: prompt.length,
    });

    // Database Save
    const [content, history] = await prisma.$transaction([
      prisma.content.create({
        data: {
          title: aiResponse.title,
          content: aiResponse.content,
          type,
          prompt,
          metadata: {
            seoScore: aiResponse.seoScore,
            keywords: aiResponse.keywords,
            readingTime: aiResponse.readingTime,
            summary: aiResponse.summary,
            modelUsed: model || defaultModel,
            provider: provider,
          },
          userId,
        },
      }),

      prisma.generationHistory.create({
        data: {
          userId,
          prompt,
          response: aiResponse.content,
          modelUsed: model || defaultModel,
        },
      }),
    ]);

    return {
      content,
      history,
      aiResponse,
    };
  }

  static async generateBulkContent(userId: string, items: { title: string; prompt: string; type: ContentType }[]) {
    const results = await Promise.allSettled(
      items.map((item) =>
        this.generateContent(userId, {
          prompt: item.prompt,
          type: item.type,
          model: "gpt-4o-mini", // Default for bulk
        })
      )
    );

    const successful = results.filter((r) => r.status === "fulfilled").map((r: any) => r.value.content);
    const failedCount = results.filter((r) => r.status === "rejected").length;

    return {
      successCount: successful.length,
      failedCount,
      data: successful,
    };
  }

  static async regenerateContent(userId: string, id: string, userRole: string) {
    const existingContent = await prisma.content.findUnique({
      where: { id },
    });

    if (!existingContent) {
      throw new AppError(status.NOT_FOUND, "Content not found");
    }

    if (userRole !== UserRole.ADMIN && existingContent.userId !== userId) {
      throw new AppError(status.FORBIDDEN, "Access denied");
    }

    const result = await this.generateContent(userId, {
      prompt: existingContent.prompt,
      type: existingContent.type,
    });

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        content: result.content.content,
        metadata: result.content.metadata as any,
        regeneratedAt: new Date(),
      },
    });

    return updatedContent;
  }

  static async getMyContents(userId: string, queryParams: IQueryParams) {
    const contentQuery = new QueryBuilder(prisma.content, queryParams, {
      searchableFields: ["title", "prompt"],
      filterableFields: ["type"],
    })
      .search()
      .filter()
      .sort()
      .paginate()
      .where({ userId, deletedAt: null });

    return await contentQuery.execute();
  }

  static async searchContents(userId: string, queryParams: IQueryParams) {
    const contentQuery = new QueryBuilder(prisma.content, queryParams, {
      searchableFields: ["title", "prompt", "type"],
    })
      .search()
      .sort()
      .paginate()
      .where({ userId, deletedAt: null });

    return await contentQuery.execute();
  }

  static async getSingleContent(userId: string, id: string, userRole: string) {
    const cacheKey = `content:${id}`;
    const cachedContent = await CacheUtils.get<any>(cacheKey);
    if (cachedContent) return cachedContent;

    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content || content.deletedAt) {
      throw new AppError(status.NOT_FOUND, "Content not found");
    }

    if (userRole !== UserRole.ADMIN && content.userId !== userId) {
      throw new AppError(status.FORBIDDEN, "Access denied");
    }

    await CacheUtils.set(cacheKey, content, 1800); // Cache for 30 mins
    return content;
  }

  static async updateContent(userId: string, id: string, data: any) {
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content || content.deletedAt) {
      throw new AppError(status.NOT_FOUND, "Content not found");
    }

    if (content.userId !== userId) {
      throw new AppError(status.FORBIDDEN, "Access denied");
    }

    const result = await prisma.content.update({
      where: { id },
      data: {
        title: data.title,
        metadata: data.metadata ? { ...(content.metadata as any), ...data.metadata } : undefined,
      },
    });

    await CacheUtils.del(`content:${id}`); // Invalidate cache
    return result;
  }

  static async deleteContent(userId: string, id: string, userRole: string) {
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content || content.deletedAt) {
      throw new AppError(status.NOT_FOUND, "Content not found");
    }

    if (userRole !== UserRole.ADMIN && content.userId !== userId) {
      throw new AppError(status.FORBIDDEN, "Access denied");
    }

    const result = await prisma.content.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await CacheUtils.del(`content:${id}`); // Invalidate cache
    return result;
  }

  static async getTeamContents(managerId: string, queryParams: IQueryParams) {
    // Find team members first
    const teamMembers = await prisma.user.findMany({
      where: { managerId },
      select: { id: true },
    });

    const memberIds = teamMembers.map((m) => m.id);

    const contentQuery = new QueryBuilder(prisma.content, queryParams, {
      searchableFields: ["title", "prompt"],
      filterableFields: ["type", "userId"],
    })
      .search()
      .filter()
      .sort()
      .paginate()
      .where({ userId: { in: memberIds }, deletedAt: null });

    return await contentQuery.execute();
  }

  static async getAllContents(queryParams: IQueryParams) {
    const contentQuery = new QueryBuilder(prisma.content, queryParams, {
      searchableFields: ["title", "prompt"],
      filterableFields: ["type", "userId"],
    })
      .search()
      .filter()
      .sort()
      .paginate()
      .where({ deletedAt: null });

    return await contentQuery.execute();
  }
}

export default AIService;