import type { NextFunction, Request, Response } from "express";
import { ROLES, type Role } from "../constants/roles";
import { User } from "../models/User";
import { AUTH_COOKIE_NAME, verifyAccessToken } from "../modules/auth/token";
import { ApiError } from "../utils/ApiError";

function extractToken(req: Request): string | undefined {
  const cookieToken: unknown = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length).trim();

  return undefined;
}

/**
 * Verifies the JWT (httpOnly cookie or Bearer header) and loads the user, so a
 * deleted account or changed role takes effect immediately. Responds 401 otherwise.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();

  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub).lean();
  if (!user) throw ApiError.unauthorized("Your session is no longer valid. Please log in again.");

  req.user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
  next();
}

/**
 * Allows the request only if the authenticated user holds one of the given
 * roles. Responds 403 otherwise. Use behind `authenticate`.
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role) throw ApiError.unauthorized();

    if (!allowedRoles.includes(role)) {
      throw ApiError.forbidden("Your role does not have access to this resource");
    }
    next();
  };
}

/** Guards a dashboard module: its own team plus Admin, who can access every module. */
export function authorizeModule(moduleRole: Exclude<Role, typeof ROLES.ADMIN | typeof ROLES.BORROWER>) {
  return authorize(moduleRole, ROLES.ADMIN);
}

/** Returns the authenticated user; use only behind `authenticate`. */
export function requireUser(req: Request) {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}
