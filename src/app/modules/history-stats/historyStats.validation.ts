import { z } from "zod";
import { ContentType } from "../../generated/prisma/enums";

const paginationSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
});

const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const historyQuerySchema = z.object({
  query: paginationSchema.merge(dateRangeSchema).extend({
    type: z.enum(ContentType).optional(),
    provider: z.string().optional(),
    status: z.string().optional(),
    searchTerm: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const analyticsQuerySchema = z.object({
  query: dateRangeSchema.extend({
    userId: z.string().optional(),
    teamId: z.string().optional(), // managerId
  }),
});

export const HistoryStatsValidation = {
  historyQuerySchema,
  analyticsQuerySchema,
};
