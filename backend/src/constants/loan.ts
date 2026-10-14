export const LOAN_STATUS = {
  APPLIED: "APPLIED",
  SANCTIONED: "SANCTIONED",
  REJECTED: "REJECTED",
  DISBURSED: "DISBURSED",
  CLOSED: "CLOSED",
} as const;

export type LoanStatus = (typeof LOAN_STATUS)[keyof typeof LOAN_STATUS];

export const ALL_LOAN_STATUSES = Object.values(LOAN_STATUS) as LoanStatus[];

/** A borrower may hold at most one loan in any of these states. */
export const ACTIVE_LOAN_STATUSES: LoanStatus[] = [
  LOAN_STATUS.APPLIED,
  LOAN_STATUS.SANCTIONED,
  LOAN_STATUS.DISBURSED,
];

/**
 * Allowed lifecycle moves. Who may trigger each move is enforced by the
 * route-level RBAC of the module that owns it:
 *   APPLIED    -> SANCTIONED | REJECTED   (Sanction team)
 *   SANCTIONED -> DISBURSED               (Disbursement team)
 *   DISBURSED  -> CLOSED                  (system, once fully repaid)
 */
export const LOAN_STATUS_TRANSITIONS: Record<LoanStatus, LoanStatus[]> = {
  APPLIED: [LOAN_STATUS.SANCTIONED, LOAN_STATUS.REJECTED],
  SANCTIONED: [LOAN_STATUS.DISBURSED],
  DISBURSED: [LOAN_STATUS.CLOSED],
  REJECTED: [],
  CLOSED: [],
};

export const LOAN_LIMITS = {
  MIN_PRINCIPAL: 50_000,
  MAX_PRINCIPAL: 500_000,
  MIN_TENURE_DAYS: 30,
  MAX_TENURE_DAYS: 365,
  /** Fixed annual simple-interest rate, in percent. */
  INTEREST_RATE: 12,
} as const;

export const EMPLOYMENT_MODES = ["SALARIED", "SELF_EMPLOYED", "UNEMPLOYED"] as const;

export type EmploymentMode = (typeof EMPLOYMENT_MODES)[number];

export const ELIGIBILITY_RULES = {
  MIN_AGE: 23,
  MAX_AGE: 50,
  MIN_MONTHLY_SALARY: 25_000,
} as const;

/** 5 letters, 4 digits, 1 letter — e.g. ABCPE1234F. The 4th letter encodes the holder type. */
export const PAN_REGEX = /^[A-Z]{3}[ABCFGHLJPT][A-Z][0-9]{4}[A-Z]$/;

/** Bank UTR / transaction reference: 12–22 alphanumeric characters (IMPS, NEFT, RTGS). */
export const UTR_REGEX = /^[A-Z0-9]{12,22}$/;

export const SALARY_SLIP = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ["application/pdf", "image/jpeg", "image/png"],
} as const;
