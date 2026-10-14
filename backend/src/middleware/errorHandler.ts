import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { ZodError } from "zod";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

interface ErrorBody {
  success: false;
  message: string;
  details?: unknown;
}

function isDuplicateKeyError(error: unknown): error is { code: number; keyValue?: Record<string, unknown> } {
  return typeof error === "object" && error !== null && (error as { code?: unknown }).code === 11000;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }));
    return ApiError.badRequest(details[0]?.message ?? "Invalid request", details);
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE" ? "File is too large. Maximum allowed size is 5 MB." : error.message;
    return ApiError.badRequest(message);
  }

  if (isDuplicateKeyError(error)) {
    const field = Object.keys(error.keyValue ?? {})[0] ?? "value";
    return ApiError.conflict(`A record with this ${field} already exists`);
  }

  if (error instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid ${error.path}`);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return ApiError.badRequest(Object.values(error.errors)[0]?.message ?? "Validation failed");
  }

  if (error instanceof SyntaxError && "body" in error) {
    return ApiError.badRequest("Malformed JSON body");
  }

  return new ApiError(500, "Something went wrong. Please try again.");
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const apiError = toApiError(error);

  if (apiError.statusCode >= 500) {
    console.error(error);
  }

  const body: ErrorBody = { success: false, message: apiError.message };
  if (apiError.details !== undefined) body.details = apiError.details;
  if (apiError.statusCode >= 500 && !env.isProduction && error instanceof Error) {
    body.details = error.message;
  }

  res.status(apiError.statusCode).json(body);
}
