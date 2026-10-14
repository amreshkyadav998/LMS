import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

/** Validates and normalises `req.body` against a Zod schema. Errors are formatted by the error handler. */
export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
}
