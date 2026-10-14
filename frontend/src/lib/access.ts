import type { Role } from "@/types";

/* Route-level access rules shared by proxy.ts and the dashboard UI. They only
   decide what to show; the API independently enforces the same rules (401/403). */

export type DashboardModule = "overview" | "sales" | "sanction" | "disbursement" | "collection";

export const MODULE_ROLES: Record<DashboardModule, Role[]> = {
  overview: ["admin"],
  sales: ["admin", "sales"],
  sanction: ["admin", "sanction"],
  disbursement: ["admin", "disbursement"],
  collection: ["admin", "collection"],
};

export const AUTH_COOKIE_NAME = "lms_token";

export function canAccessModule(role: Role, module: DashboardModule): boolean {
  return MODULE_ROLES[module].includes(role);
}

export function homePathForRole(role: Role): string {
  switch (role) {
    case "borrower":
      return "/portal";
    case "admin":
      return "/dashboard/overview";
    default:
      return `/dashboard/${role}`;
  }
}

export function moduleFromPath(pathname: string): DashboardModule | null {
  const segment = pathname.split("/")[2];
  return segment && segment in MODULE_ROLES ? (segment as DashboardModule) : null;
}
