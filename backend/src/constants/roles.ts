export const ROLES = {
  ADMIN: "admin",
  SALES: "sales",
  SANCTION: "sanction",
  DISBURSEMENT: "disbursement",
  COLLECTION: "collection",
  BORROWER: "borrower",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES = Object.values(ROLES) as Role[];

/** Roles that work on the operations dashboard. */
export const STAFF_ROLES: Role[] = ALL_ROLES.filter((role) => role !== ROLES.BORROWER);
