import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { ContentType, UserRole } from "../../generated/prisma/enums";
import status from "http-status";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interface/query.interface";
import { LoggerUtils } from "../../utils/logger.utils";
import { CacheUtils } from "../../utils/cache.utils";
import { getAIProvider } from "./providers";
import { envVariable } from "../../../config/env";

export type GenerateContentInput = {
  prompt: string;
  type: ContentType;
  tone?: string;
  length?: "short" | "medium" | "long";
  keywords?: string[];
  model?: string;
};

class AIService {


  static async generateContent(userId: string, input: GenerateContentInput) {
    const {
      prompt,
      type,
      tone = "professional",
      length = "medium",
      keywords = [],
      model,
    } = input;

    const provider = "gemini";
    const defaultModel = envVariable.GEMINI_MODEL || "gemini-1.5-flash";

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

    const startTime = Date.now();
    let aiResponse: any;

    try {
      LoggerUtils.ai.info("Starting AI Generation", { userId, provider, model: defaultModel });
      const aiProvider = getAIProvider();
      aiResponse = await aiProvider.generateContent(systemPrompt, userPrompt, defaultModel);

      if (!aiResponse || !aiResponse.content) {
        throw new Error("AI provider returned empty content");
      }

      const generationDuration = Date.now() - startTime;
      LoggerUtils.ai.performance("Generation Duration", generationDuration, { userId, provider });
      LoggerUtils.ai.info("AI Generation Success", { userId, provider, title: aiResponse.title });
    } catch (error: any) {
      LoggerUtils.ai.error(provider, `AI Generation Failed: ${error.message}`, { userId, model: defaultModel });
      throw new AppError(
        status.BAD_GATEWAY,
        `Gemini Error: ${error.message}`
      );
    }

    // AI Generation Log
    LoggerUtils.ai.generation(provider, defaultModel, userId, {
      type,
      tone,
      promptLength: prompt.length,
    });

    // Database Save
    const dbStartTime = Date.now();
    try {
      LoggerUtils.ai.info("Persisting AI Content to Database", { userId, title: aiResponse.title });

      const [content, history] = await prisma.$transaction([
        prisma.content.create({
          data: {
            title: aiResponse.title || "Untitled Content",
            content: aiResponse.content,
            type,
            prompt,
            metadata: {
              seoScore: aiResponse.seoScore || 0,
              keywords: aiResponse.keywords || [],
              readingTime: aiResponse.readingTime || 0,
              summary: aiResponse.summary || "",
              modelUsed: defaultModel,
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
            modelUsed: defaultModel,
          },
        }),
      ], {
        timeout: 15000 // 15 seconds
      });

      const dbDuration = Date.now() - dbStartTime;
      const totalDuration = Date.now() - startTime;

      LoggerUtils.ai.performance("Database Persistence Duration", dbDuration, { userId, contentId: content.id });
      LoggerUtils.ai.performance("Total Request Duration", totalDuration, { userId, contentId: content.id });
      LoggerUtils.ai.info("Database Persistence Successful", { contentId: content.id, userId });

      return {
        content,
        history,
        aiResponse,
      };
    } catch (dbError: any) {
      LoggerUtils.ai.error("DATABASE_SAVE_FAILED", dbError.message, { userId, prompt: prompt.substring(0, 100) });
      throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to save generated content to database");
    }
  }

  static async generateBulkContent(userId: string, items: { title: string; prompt: string; type: ContentType }[]) {
    const results = await Promise.allSettled(
      items.map((item) =>
        this.generateContent(userId, {
          prompt: item.prompt,
          type: item.type,
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