import { z } from "zod";
import { UserRole } from "../../generated/prisma/enums";

export const updateMeSchema = z.object({
  name: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(500).optional(),
  socialLinks: z.array(z.string().url()).optional(),
  preferences: z.object({
    theme: z.enum(["light", "dark"]).optional(),
    language: z.string().optional(),
  }).optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN]),
});

export const userFilterSchema = z.object({
  role: z.enum([UserRole.USER, UserRole.MANAGER, UserRole.ADMIN]).optional(),
  status: z.string().optional(),
  verified: z.boolean().optional(),
  blocked: z.boolean().optional(),
  searchTerm: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const UserValidation = {
  updateMeSchema,
  updateRoleSchema,
  userFilterSchema,
};
