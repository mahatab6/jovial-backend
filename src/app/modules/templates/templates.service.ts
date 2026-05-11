
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interface/query.interface";
import { Template } from "../../generated/prisma/client";

const createTemplateIntoDB = async (payload: Template): Promise<Template> => {
  const result = await prisma.template.create({
    data: payload,
  });
  return result;
};

const getAllTemplatesFromDB = async (queryParams: IQueryParams) => {
  // Filter out "All" values from query params
  const sanitizedQuery = { ...queryParams };
  Object.keys(sanitizedQuery).forEach((key) => {
    if (sanitizedQuery[key] === "All") {
      delete sanitizedQuery[key];
    }
  });

  const sortBy = sanitizedQuery.sortBy as string;
  if (sortBy === "Most Popular") {
    sanitizedQuery.sortBy = "rating";
    sanitizedQuery.sortOrder = "desc";
  } else if (sortBy === "Newest") {
    sanitizedQuery.sortBy = "createdAt";
    sanitizedQuery.sortOrder = "desc";
  } else if (sortBy === "A-Z") {
    sanitizedQuery.sortBy = "name";
    sanitizedQuery.sortOrder = "asc";
  }

  const queryBuilder = new QueryBuilder(
    prisma.template as any,
    sanitizedQuery as any,
    {
      searchableFields: ["name", "description", "category"],
      filterableFields: ["category", "rating"],
    }
  );

  const result = await queryBuilder
    .search()
    .filter()
    .sort()
    .paginate()
    .execute();

  return result;
};

const getTemplateByIdFromDB = async (id: string) => {
  const template = await prisma.template.findUnique({
    where: { id },
  });

  if (!template) return null;

  // Fetch related templates (same category)
  const relatedTemplates = await prisma.template.findMany({
    where: {
      category: template.category,
      id: { not: id },
    },
    take: 3,
    orderBy: { rating: 'desc' },
  });

  return {
    ...template,
    relatedTemplates,
    reviews: [
      { id: "r1", rating: 5, reviewText: "This template saved me hours of work! Highly recommend.", created: "2024-05-01" },
      { id: "r2", rating: 4, reviewText: "Good output, just needed a few minor tweaks.", created: "2024-05-02" }
    ]
  };
};

const updateTemplateIntoDB = async (
  id: string,
  payload: Partial<Template>
): Promise<Template | null> => {
  const result = await prisma.template.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteTemplateFromDB = async (id: string): Promise<Template | null> => {
  const result = await prisma.template.delete({
    where: { id },
  });
  return result;
};

export const TemplateService = {
  createTemplateIntoDB,
  getAllTemplatesFromDB,
  getTemplateByIdFromDB,
  updateTemplateIntoDB,
  deleteTemplateFromDB,
};
