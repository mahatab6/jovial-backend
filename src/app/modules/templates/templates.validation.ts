import { z } from "zod";

const createTemplateZodSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    previewText: z.string(),
    specifications: z.string(),
    rating: z.number().optional(),
    reviewCount: z.number().optional(),
  }),
});

const updateTemplateZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    previewText: z.string().optional(),
    specifications: z.string().optional(),
    rating: z.number().optional(),
    reviewCount: z.number().optional(),
  }),
});

export const TemplateValidation = {
  createTemplateZodSchema,
  updateTemplateZodSchema,
};
