import type { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError";

export function validateObjectId(paramName: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!isValidObjectId(req.params[paramName])) {
      throw ApiError.badRequest(`Invalid ${paramName}`);
    }
    next();
  };
}
