"use client";

import { ArrowRight, BriefcaseBusiness, Building2, IndianRupee, UserX } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { ApiClientError, api, errorMessage } from "@/lib/api";
import { ELIGIBILITY_RULES, EMPLOYMENT_MODE_LABELS, PAN_REGEX } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { toDateInputValue } from "@/lib/format";
import { calculateAge } from "@/lib/loan";
import type { BorrowerProfile, EligibilityFailure, EmploymentMode } from "@/types";

const EMPLOYMENT_OPTIONS: { value: EmploymentMode; icon: typeof Building2 }[] = [
  { value: "SALARIED", icon: Building2 },
  { value: "SELF_EMPLOYED", icon: BriefcaseBusiness },
  { value: "UNEMPLOYED", icon: UserX },
];

interface FormState {
  fullName: string;
  pan: string;
  dateOfBirth: string;
  monthlySalary: string;
  employmentMode: EmploymentMode | "";
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

function initialState(profile: BorrowerProfile | null): FormState {
  return {
    fullName: profile?.fullName ?? "",
    pan: profile?.pan ?? "",
    dateOfBirth: profile ? toDateInputValue(new Date(profile.dateOfBirth)) : "",
    monthlySalary: profile ? String(profile.monthlySalary) : "",
    employmentMode: profile?.employmentMode ?? "",
  };
}

/** Required-field checks only; eligibility itself is decided by the server-side BRE. */
function validateRequired(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (form.fullName.trim().length < 2) errors.fullName = "Enter your full name as on PAN";
  if (form.pan.length !== 10) errors.pan = "PAN must be 10 characters";
  if (!form.dateOfBirth) errors.dateOfBirth = "Enter your date of birth";
  if (form.monthlySalary === "" || Number(form.monthlySalary) < 0) errors.monthlySalary = "Enter your monthly salary";
  if (!form.employmentMode) errors.employmentMode = "Select your employment mode";
  return errors;
}

interface PersonalDetailsStepProps {
  profile: BorrowerProfile | null;
  onComplete: (profile: BorrowerProfile) => void;
}

export function PersonalDetailsStep({ profile, onComplete }: PersonalDetailsStepProps) {
  const [form, setForm] = useState<FormState>(() => initialState(profile));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failures, setFailures] = useState<EligibilityFailure[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  // Live, non-blocking hints so the applicant sees issues before submitting.
  const age = form.dateOfBirth ? calculateAge(new Date(form.dateOfBirth)) : null;
  const ageOutOfRange =
    age !== null && (age < ELIGIBILITY_RULES.MIN_AGE || age > ELIGIBILITY_RULES.MAX_AGE);
  const ageHint =
    age === null ? undefined : ageOutOfRange ? (
      <span className="text-amber-600">
        You are {age}. Applicants must be {ELIGIBILITY_RULES.MIN_AGE}–{ELIGIBILITY_RULES.MAX_AGE} years old.
      </span>
    ) : (
      `Age: ${age} years`
    );
  const panLooksValid = form.pan.length === 10 && PAN_REGEX.test(form.pan);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailures([]);
    setFormError(null);

    const fieldErrors = validateRequired(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { profile: saved } = await api<{ profile: BorrowerProfile }>("/borrower/profile", {
        method: "PUT",
        body: { ...form, monthlySalary: Number(form.monthlySalary) },
      });
      onComplete(saved);
    } catch (err) {
      const details = err instanceof ApiClientError ? (err.details as { failures?: EligibilityFailure[] }) : undefined;
      if (details?.failures?.length) setFailures(details.failures);
      else setFormError(errorMessage(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {failures.length > 0 && (
        <Alert tone="error" title="Sorry, you are not eligible for a loan right now">
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {failures.map((failure) => (
              <li key={failure.rule}>{failure.message}</li>
            ))}
          </ul>
        </Alert>
      )}
      {formError && <Alert tone="error">{formError}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name (as on PAN)" htmlFor="fullName" error={errors.fullName} className="sm:col-span-2">
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Priya Sharma"
            value={form.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            invalid={Boolean(errors.fullName)}
          />
        </Field>

        <Field
          label="PAN"
          htmlFor="pan"
          error={errors.pan}
          hint={
            form.pan.length === 10 && !panLooksValid ? (
              <span className="text-amber-600">This doesn’t look like a valid PAN (format: ABCPE1234F).</span>
            ) : (
              "10 characters, e.g. ABCPE1234F"
            )
          }
        >
          <Input
            id="pan"
            placeholder="ABCPE1234F"
            maxLength={10}
            className="font-mono tracking-widest uppercase"
            value={form.pan}
            onChange={(event) => update("pan", event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            invalid={Boolean(errors.pan)}
          />
        </Field>

        <Field
          label="Date of birth"
          htmlFor="dateOfBirth"
          error={errors.dateOfBirth}
          hint={ageHint}
        >
          <Input
            id="dateOfBirth"
            type="date"
            max={toDateInputValue()}
            value={form.dateOfBirth}
            onChange={(event) => update("dateOfBirth", event.target.value)}
            invalid={Boolean(errors.dateOfBirth)}
          />
        </Field>

        <Field
          label="Monthly salary"
          htmlFor="monthlySalary"
          error={errors.monthlySalary}
          hint={`Minimum ₹${ELIGIBILITY_RULES.MIN_MONTHLY_SALARY.toLocaleString("en-IN")} per month`}
          className="sm:col-span-2"
        >
          <Input
            id="monthlySalary"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="50000"
            value={form.monthlySalary}
            onChange={(event) => update("monthlySalary", event.target.value)}
            leading={<IndianRupee className="size-4" />}
            invalid={Boolean(errors.monthlySalary)}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">Employment mode</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {EMPLOYMENT_OPTIONS.map(({ value, icon: Icon }) => {
            const selected = form.employmentMode === value;
            return (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl p-4 ring-1 transition ring-inset",
                  selected ? "bg-brand-50/70 ring-2 ring-brand-600" : "bg-white ring-slate-200 hover:ring-slate-300",
                )}
              >
                <input
                  type="radio"
                  name="employmentMode"
                  value={value}
                  checked={selected}
                  onChange={() => update("employmentMode", value)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    selected ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  <Icon className="size-[18px]" />
                </span>
                <span className="text-sm font-semibold text-slate-800">{EMPLOYMENT_MODE_LABELS[value]}</span>
              </label>
            );
          })}
        </div>
        {errors.employmentMode && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.employmentMode}</p>}
      </fieldset>

      <div className="flex justify-end border-t border-slate-100 pt-6">
        <Button type="submit" size="lg" loading={submitting}>
          Check eligibility & continue <ArrowRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}
