import { ELIGIBILITY_RULES, PAN_REGEX, type EmploymentMode } from "../../constants/loan";
import { calculateAge } from "../../utils/date";

/**
 * Business Rule Engine (BRE).
 *
 * The client runs the same checks for instant feedback, but this server-side
 * evaluation is the source of truth: client checks can be bypassed by calling
 * the API directly, so every rule is re-evaluated here before anything is saved,
 * and again when the loan is submitted (the applicant's age may have changed).
 */

export type EligibilityRule = "AGE" | "SALARY" | "PAN" | "EMPLOYMENT";

export interface EligibilityFailure {
  rule: EligibilityRule;
  message: string;
}

export interface EligibilityInput {
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
}

export interface EligibilityResult {
  eligible: boolean;
  failures: EligibilityFailure[];
}

export function evaluateEligibility(input: EligibilityInput, today: Date = new Date()): EligibilityResult {
  const failures: EligibilityFailure[] = [];
  const { MIN_AGE, MAX_AGE, MIN_MONTHLY_SALARY } = ELIGIBILITY_RULES;

  const age = calculateAge(input.dateOfBirth, today);
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
    failures.push({
      rule: "PAN",
      message: "PAN must be in the valid format (e.g. ABCPE1234F).",
    });
  }

  if (input.employmentMode === "UNEMPLOYED") {
    failures.push({
      rule: "EMPLOYMENT",
      message: "Unemployed applicants are not eligible for a loan.",
    });
  }

  return { eligible: failures.length === 0, failures };
}
