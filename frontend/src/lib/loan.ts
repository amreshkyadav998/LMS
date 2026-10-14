import type { EligibilityFailure, EmploymentMode } from "@/types";
import { ELIGIBILITY_RULES, LOAN_LIMITS, PAN_REGEX } from "./constants";

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** SI = (P × R × T) / (365 × 100), T in days. Same formula the API uses. */
export function calculateLoanQuote(principal: number, tenureDays: number) {
  const simpleInterest = roundCurrency((principal * LOAN_LIMITS.INTEREST_RATE * tenureDays) / (365 * 100));
  return {
    principal,
    tenureDays,
    interestRate: LOAN_LIMITS.INTEREST_RATE,
    simpleInterest,
    totalRepayment: roundCurrency(principal + simpleInterest),
  };
}

export function calculateAge(dateOfBirth: Date, today: Date = new Date()): number {
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const birthdayPassed =
    today.getMonth() > dateOfBirth.getMonth() ||
    (today.getMonth() === dateOfBirth.getMonth() && today.getDate() >= dateOfBirth.getDate());
  return birthdayPassed ? age : age - 1;
}

/** Client-side preview of the Business Rule Engine, for instant feedback only. */
export function checkEligibility(input: {
  pan: string;
  dateOfBirth: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
}): EligibilityFailure[] {
  const failures: EligibilityFailure[] = [];
  const { MIN_AGE, MAX_AGE, MIN_MONTHLY_SALARY } = ELIGIBILITY_RULES;

  const age = calculateAge(new Date(input.dateOfBirth));
  if (age < MIN_AGE || age > MAX_AGE) {
    failures.push({
      rule: "AGE",
      message: `Applicant must be between ${MIN_AGE} and ${MAX_AGE} years old (current age: ${age}).`,
    });
  }
  if (input.monthlySalary < MIN_MONTHLY_SALARY) {
    failures.push({
      rule: "SALARY",
      message: `Monthly salary must be at least ₹${MIN_MONTHLY_SALARY.toLocaleString("en-IN")}.`,
    });
  }
  if (!PAN_REGEX.test(input.pan.toUpperCase())) {
    failures.push({ rule: "PAN", message: "PAN must be in the valid format (e.g. ABCPE1234F)." });
  }
  if (input.employmentMode === "UNEMPLOYED") {
    failures.push({ rule: "EMPLOYMENT", message: "Unemployed applicants are not eligible for a loan." });
  }
  return failures;
}
