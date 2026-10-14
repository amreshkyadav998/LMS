import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, canAccessModule, homePathForRole, moduleFromPath } from "@/lib/access";
import type { Role } from "@/types";

/**
 * Optimistic route guard. It reads the role from the session JWT to redirect
 * users away from pages they cannot use. It does not verify the signature:
 * the API verifies every request and rejects unauthorised ones with 401/403,
 * so a forged cookie can at most render an empty shell.
 */

interface SessionClaims {
  role: Role;
  exp?: number;
}

function readSession(request: NextRequest): SessionClaims | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token?.split(".")[1];
  if (!payload) return null;

  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const claims = JSON.parse(json) as SessionClaims;
    if (!claims.role || (claims.exp && claims.exp * 1000 < Date.now())) return null;
    return claims;
  } catch {
    return null;
  }
}

function redirectTo(request: NextRequest, pathname: string, withNext = false) {
  const url = new URL(pathname, request.url);
  if (withNext) url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = readSession(request);
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    return session ? redirectTo(request, homePathForRole(session.role)) : NextResponse.next();
  }

  if (!session) return redirectTo(request, "/login", true);

  const home = homePathForRole(session.role);

  if (pathname.startsWith("/portal")) {
    return session.role === "borrower" ? NextResponse.next() : redirectTo(request, home);
  }

  // Dashboard
  if (session.role === "borrower") return redirectTo(request, home);

  const dashboardModule = moduleFromPath(pathname);
  if (!dashboardModule || !canAccessModule(session.role, dashboardModule)) {
    return redirectTo(request, home);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/portal/:path*", "/dashboard/:path*", "/dashboard"],
};
