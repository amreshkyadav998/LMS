import type { Request, Response } from "express";
import { requireUser } from "../../middleware/auth";
import { sendSuccess } from "../../utils/http";
import * as authService from "./auth.service";
import { AUTH_COOKIE_NAME, authCookieOptions } from "./token";

export async function signup(req: Request, res: Response) {
  const { user, token } = await authService.signup(req.body);
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions(token));
  sendSuccess(res, { user, token }, 201);
}

export async function login(req: Request, res: Response) {
  const { user, token } = await authService.login(req.body);
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions(token));
  sendSuccess(res, { user, token });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions());
  sendSuccess(res, { loggedOut: true });
}

export function me(req: Request, res: Response) {
  sendSuccess(res, { user: requireUser(req) });
}
