import type { CookieOptions } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import type { Role } from "../../constants/roles";
import { ApiError } from "../../utils/ApiError";

export const AUTH_COOKIE_NAME = "lms_token";

export interface AccessTokenPayload {
  sub: string;
  role: Role;
  name: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
  } catch {
    throw ApiError.unauthorized("Your session has expired. Please log in again.");
  }
}

/** Reads the `exp` claim so the cookie expires together with the token. */
function tokenMaxAgeMs(token: string): number | undefined {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  return decoded?.exp ? decoded.exp * 1000 - Date.now() : undefined;
}

export function authCookieOptions(token?: string): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: token ? tokenMaxAgeMs(token) : undefined,
  };
}
