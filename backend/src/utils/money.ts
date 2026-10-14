import { LOAN_LIMITS } from "../constants/loan";

/** Rounds a rupee amount to 2 decimal places (paise), avoiding float drift. */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export interface LoanQuote {
  principal: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
}

/**
 * Simple interest on a day basis:
 *   SI    = (P × R × T) / (365 × 100)   where T is the tenure in days
 *   Total = P + SI
 */
export function calculateLoanQuote(principal: number, tenureDays: number): LoanQuote {
  const interestRate = LOAN_LIMITS.INTEREST_RATE;
  const simpleInterest = roundCurrency((principal * interestRate * tenureDays) / (365 * 100));

  return {
    principal,
    tenureDays,
    interestRate,
    simpleInterest,
    totalRepayment: roundCurrency(principal + simpleInterest),
  };
}

export function formatInr(value: number): string {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
