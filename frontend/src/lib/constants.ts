import type { EmploymentMode, LeadStage, LoanStatus, Role } from "@/types";

/* Mirrors the API's business rules so the UI can validate before submitting.
   The server re-checks everything and remains the source of truth. */

export const LOAN_LIMITS = {
  MIN_PRINCIPAL: 50_000,
  MAX_PRINCIPAL: 500_000,
  PRINCIPAL_STEP: 5_000,
  MIN_TENURE_DAYS: 30,
  MAX_TENURE_DAYS: 365,
  INTEREST_RATE: 12,
} as const;

export const ELIGIBILITY_RULES = {
  MIN_AGE: 23,
  MAX_AGE: 50,
  MIN_MONTHLY_SALARY: 25_000,
} as const;

export const PAN_REGEX = /^[A-Z]{3}[ABCFGHLJPT][A-Z][0-9]{4}[A-Z]$/;
export const UTR_REGEX = /^[A-Z0-9]{12,22}$/;

export const SALARY_SLIP = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ACCEPT: ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png",
  MIME_TYPES: ["application/pdf", "image/jpeg", "image/png"] as readonly string[],
} as const;

export const EMPLOYMENT_MODE_LABELS: Record<EmploymentMode, string> = {
  SALARIED: "Salaried",
  SELF_EMPLOYED: "Self-Employed",
  UNEMPLOYED: "Unemployed",
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  sales: "Sales Executive",
  sanction: "Sanction Executive",
  disbursement: "Disbursement Executive",
  collection: "Collection Executive",
  borrower: "Borrower",
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  APPLIED: "Applied",
  SANCTIONED: "Sanctioned",
  REJECTED: "Rejected",
  DISBURSED: "Disbursed",
  CLOSED: "Closed",
};

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  REGISTERED: "Registered",
  DETAILS_SUBMITTED: "Details submitted",
  SLIP_UPLOADED: "Slip uploaded",
};
