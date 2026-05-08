import { z } from "zod";

export const analyticsQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    interval: z.enum(["day", "week", "month"]).optional().default("day"),
  }),
});

export const userManagementQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
    searchTerm: z.string().optional(),
    role: z.string().optional(),
    blocked: z.string().optional().transform((val) => val === "true"),
    verified: z.string().optional().transform((val) => val === "true"),
    plan: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const AdminValidation = {
  analyticsQuerySchema,
  userManagementQuerySchema,
};
