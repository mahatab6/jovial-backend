import { z } from "zod";
import { ContentType } from "../../generated/prisma/enums";

export const generateContentSchema = z.object({
  prompt: z.string().min(10).max(5000),
  type: z.enum(ContentType),
  tone: z.string().optional(),
  length: z.enum(["short", "medium", "long"]).optional(),
  keywords: z.array(z.string()).optional(),
  model: z.string().optional().default("gpt-4o-mini"),
});

export const bulkGenerateContentSchema = z.object({
  items: z.array(
    z.object({
      title: z.string().min(1).max(255),
      prompt: z.string().min(10).max(5000),
      type: z.enum(ContentType),
    })
  ),
});

export const updateContentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.object(z.any()).optional(),
});