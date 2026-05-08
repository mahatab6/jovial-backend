import {
    IQueryConfig,
    IQueryParams,
    IQueryResult,
    PrismaCountArgs,
    PrismaFindManyArgs,
    PrismaModelDelegate,
    PrismaNumberFilter,
    PrismaStringFilter,
} from "../interface/query.interface";

export class QueryBuilder<
    T,
    TWhereInput = Record<string, unknown>,
    TInclude = Record<string, unknown>,
> {
    private query: PrismaFindManyArgs;
    private countQuery: PrismaCountArgs;

    private page = 1;
    private limit = 10;
    private skip = 0;

    private selectFields?: Record<string, boolean>;

    constructor(
        private model: PrismaModelDelegate,
        private queryParams: IQueryParams,
        private config: IQueryConfig = {},
    ) {
        this.queryParams = this.normalizeQueryParams(
            queryParams as Record<string, unknown>,
        ) as IQueryParams;

        this.query = {
            where: {},
            include: {},
            orderBy: {},
            skip: 0,
            take: 10,
        };

        this.countQuery = {
            where: {},
        };
    }

    /*
    =========================
    SEARCH
    =========================
    */

    search(): this {
        const { searchTerm } = this.queryParams;
        const { searchableFields } = this.config;

        if (!searchTerm || !searchableFields?.length) return this;

        const conditions = searchableFields.map((field) => {
            const filter: PrismaStringFilter = {
                contains: searchTerm,
                mode: "insensitive",
            };

            return this.buildNestedRelationFilter(field, filter);
        });

        (this.query.where as any).OR = conditions;
        (this.countQuery.where as any).OR = conditions;

        return this;
    }

    /*
    =========================
    FILTER
    =========================
    */

    filter(): this {
        const { filterableFields } = this.config;

        const excludedFields = [
            "searchTerm",
            "page",
            "limit",
            "sortBy",
            "sortOrder",
            "fields",
            "include",
        ];

        const queryWhere = this.query.where as Record<string, unknown>;
        const countWhere = this.countQuery.where as Record<string, unknown>;

        Object.entries(this.queryParams).forEach(([key, value]) => {
            if (excludedFields.includes(key)) return;

            if (value === undefined || value === "") return;

            const allowed =
                !filterableFields ||
                filterableFields.length === 0 ||
                filterableFields.includes(key);

            if (!allowed) return;

            const parsedValue = this.parseFilterInput(value);

            if (key.includes(".")) {
                const nested = this.buildNestedRelationFilter(key, parsedValue);

                Object.assign(queryWhere, nested);
                Object.assign(countWhere, nested);

                return;
            }

            queryWhere[key] = parsedValue;
            countWhere[key] = parsedValue;
        });

        return this;
    }

    /*
    =========================
    PAGINATION
    =========================
    */

    paginate(): this {
        this.page = Number(this.queryParams.page) || 1;
        this.limit = Number(this.queryParams.limit) || 10;

        this.skip = (this.page - 1) * this.limit;

        this.query.skip = this.skip;
        this.query.take = this.limit;

        return this;
    }

    /*
    =========================
    SORT
    =========================
    */

    sort(): this {
        const sortBy = this.queryParams.sortBy || "createdAt";
        const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";

        this.query.orderBy = this.buildNestedRelationFilter(sortBy, sortOrder);

        return this;
    }

    /*
    =========================
    FIELD SELECTION
    =========================
    */

    fields(): this {
        const fields = this.queryParams.fields;

        if (!fields || typeof fields !== "string") return this;

        this.selectFields = {};

        fields.split(",").forEach((field) => {
            this.selectFields![field.trim()] = true;
        });

        this.query.select = this.selectFields;

        delete this.query.include;

        return this;
    }

    /*
    =========================
    INCLUDE RELATIONS
    =========================
    */

    include(relations: TInclude): this {
        if (this.selectFields) return this;

        this.query.include = {
            ...(this.query.include as object),
            ...(relations as object),
        };

        return this;
    }

    dynamicInclude(
        includeConfig: Record<string, unknown>,
        defaultInclude?: string[],
    ): this {
        if (this.selectFields) return this;

        const result: Record<string, unknown> = {};

        defaultInclude?.forEach((field) => {
            if (includeConfig[field]) result[field] = includeConfig[field];
        });

        const includeParam = this.queryParams.include;

        if (typeof includeParam === "string") {
            includeParam.split(",").forEach((relation) => {
                const trimmed = relation.trim();

                if (includeConfig[trimmed]) {
                    result[trimmed] = includeConfig[trimmed];
                }
            });
        }

        this.query.include = {
            ...(this.query.include as object),
            ...result,
        };

        return this;
    }

    /*
    =========================
    WHERE MERGE
    =========================
    */

    where(condition: TWhereInput): this {
        this.query.where = this.deepMerge(
            this.query.where as object,
            condition as object,
        );

        this.countQuery.where = this.deepMerge(
            this.countQuery.where as object,
            condition as object,
        );

        return this;
    }

    /*
    =========================
    EXECUTE
    =========================
    */

    async execute(): Promise<IQueryResult<T>> {
        const [total, data] = await Promise.all([
            this.model.count(this.countQuery as any),
            this.model.findMany(this.query as any),
        ]);

        return {
            data,
            meta: {
                page: this.page,
                limit: this.limit,
                total,
                totalPages: Math.ceil(total / this.limit),
            },
        };
    }

    /*
    =========================
    HELPERS
    =========================
    */

    private parseFilterInput(value: unknown) {
        if (typeof value === "object" && !Array.isArray(value)) {
            return this.parseRangeFilter(value as Record<string, unknown>);
        }

        return this.parsePrimitive(value);
    }

    private parsePrimitive(value: unknown) {
        if (value === "true") return true;

        if (value === "false") return false;

        if (typeof value === "string" && !isNaN(Number(value))) {
            return Number(value);
        }

        if (Array.isArray(value)) {
            return { in: value };
        }

        return value;
    }

    private parseRangeFilter(
        value: Record<string, unknown>,
    ): PrismaNumberFilter | PrismaStringFilter {
        const result: Record<string, unknown> = {};

        Object.entries(value).forEach(([op, val]) => {
            result[op] =
                typeof val === "string" && !isNaN(Number(val))
                    ? Number(val)
                    : val;
        });

        return result;
    }

    private normalizeQueryParams(
        params: Record<string, unknown>,
    ): Record<string, unknown> {
        const normalized: Record<string, unknown> = {};

        Object.entries(params).forEach(([key, value]) => {
            const match = key.match(/^(.+)\[(.+)\]$/);

            if (!match) {
                normalized[key] = value;
                return;
            }

            const [, field, operator] = match;

            if (!normalized[field]) {
                normalized[field] = {};
            }

            (normalized[field] as Record<string, unknown>)[operator] = value;
        });

        return normalized;
    }

    private buildNestedRelationFilter(
        path: string,
        value: unknown,
    ): Record<string, unknown> {
        const parts = path.split(".");

        if (parts.length === 1) {
            return { [path]: value };
        }

        if (parts.length === 2) {
            return {
                [parts[0]]: {
                    [parts[1]]: value,
                },
            };
        }

        if (parts.length === 3) {
            return {
                [parts[0]]: {
                    some: {
                        [parts[1]]: {
                            [parts[2]]: value,
                        },
                    },
                },
            };
        }

        return {};
    }

    private deepMerge(target: any, source: any) {
        const result = { ...target };

        Object.keys(source).forEach((key) => {
            if (
                typeof source[key] === "object" &&
                !Array.isArray(source[key])
            ) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        });

        return result;
    }
}