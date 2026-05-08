import { z } from "zod";
import { ContentType } from "../../generated/prisma/enums";


export const generateContentSchema = z.object({
  prompt: z.string().min(10).max(5000),
  type: z.nativeEnum(ContentType),
  tone: z.string().optional(),
  length: z.enum(["short", "medium", "long"]).optional(),
  keywords: z.array(z.string()).optional(),
  model: z.string().optional().default("gpt-4o-mini"),
});