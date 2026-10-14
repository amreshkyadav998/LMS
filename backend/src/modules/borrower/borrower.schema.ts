import { z } from "zod";
import { EMPLOYMENT_MODES, LOAN_LIMITS } from "../../constants/loan";

/**
 * Shape validation only. Eligibility (age, salary, PAN format, employment) is
 * decided by the BRE so the borrower gets a complete list of failed rules.
 */
export const personalDetailsSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  pan: z.string().trim().toUpperCase().length(10, "PAN must be 10 characters"),
  dateOfBirth: z.coerce
    .date({ error: "Enter a valid date of birth" })
    .refine((date) => date.getTime() < Date.now(), "Date of birth must be in the past"),
  monthlySalary: z.coerce.number().min(0, "Monthly salary cannot be negative").max(100_000_000),
  employmentMode: z.enum(EMPLOYMENT_MODES, { error: "Select a valid employment mode" }),
});

export const loanApplicationSchema = z.object({
  principal: z.coerce
    .number()
    .int("Loan amount must be a whole number")
    .min(LOAN_LIMITS.MIN_PRINCIPAL, `Loan amount must be at least ₹${LOAN_LIMITS.MIN_PRINCIPAL.toLocaleString("en-IN")}`)
    .max(LOAN_LIMITS.MAX_PRINCIPAL, `Loan amount must be at most ₹${LOAN_LIMITS.MAX_PRINCIPAL.toLocaleString("en-IN")}`),
  tenureDays: z.coerce
    .number()
    .int("Tenure must be a whole number of days")
    .min(LOAN_LIMITS.MIN_TENURE_DAYS, `Tenure must be at least ${LOAN_LIMITS.MIN_TENURE_DAYS} days`)
    .max(LOAN_LIMITS.MAX_TENURE_DAYS, `Tenure must be at most ${LOAN_LIMITS.MAX_TENURE_DAYS} days`),
});

export type PersonalDetailsInput = z.infer<typeof personalDetailsSchema>;
export type LoanApplicationInput = z.infer<typeof loanApplicationSchema>;
