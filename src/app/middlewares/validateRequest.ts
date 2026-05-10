import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodEffects, ZodError } from "zod";

/**
 * validateRequest Middleware
 * 
 * WHY THIS ERROR HAPPENS:
 * In Express, 'req.query' and 'req.params' are often implemented as getters on the prototype. 
 * Reassigning them directly (req.query = validatedData) fails because they lack setters.
 * 
 * THE SOLUTION:
 * Instead of reassigning the objects, we update their contents using Object.assign().
 * This preserves the reference and avoids the readonly property error.
 */
export const validateRequest = (schema: AnyZodObject | ZodEffects<AnyZodObject>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Handle "data" wrapper if it exists (common in some JSON-in-form-data scenarios)
      if (req.body?.data && typeof req.body.data === "string") {
        try {
          req.body = JSON.parse(req.body.data);
        } catch (error) {
          // Fall through
        }
      }

      // 2. Identify if the schema is structured { body, query, params } 
      // or just a direct body schema.
      const schemaShape = (schema as any).shape || (schema as any)._def?.schema?.shape;
      const isStructured = schemaShape && (schemaShape.body || schemaShape.query || schemaShape.params);

      if (isStructured) {
        const parsed = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        // Safe assignment using Object.assign to avoid "readonly" errors
        if (parsed.body) req.body = parsed.body;
        
        if (parsed.query) {
          Object.keys(req.query).forEach(k => delete req.query[k]);
          Object.assign(req.query, parsed.query);
        }
        
        if (parsed.params) {
          Object.keys(req.params).forEach(k => delete req.params[k]);
          Object.assign(req.params, parsed.params);
        }
      } else {
        // Direct body validation (Legacy/Simple mode)
        const validatedBody = await schema.parseAsync(req.body);
        req.body = validatedBody;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(error);
      }
      next(error);
    }
  };
};
