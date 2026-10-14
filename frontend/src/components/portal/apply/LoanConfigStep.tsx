"use client";

import { ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { LoanSliders, QuoteSummary } from "@/components/loan/LoanCalculator";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { api, errorMessage } from "@/lib/api";
import { EMPLOYMENT_MODE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { BorrowerProfile, Loan } from "@/types";

interface LoanConfigStepProps {
  profile: BorrowerProfile;
  onApplied: (loan: Loan) => void;
  onBack: () => void;
}

export function LoanConfigStep({ profile, onApplied, onBack }: LoanConfigStepProps) {
  const [principal, setPrincipal] = useState(100_000);
  const [tenureDays, setTenureDays] = useState(180);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    setSubmitting(true);
    setError(null);
    try {
      const { loan } = await api<{ loan: Loan }>("/borrower/loans", {
        method: "POST",
        body: { principal, tenureDays },
      });
      onApplied(loan);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-8">
          <LoanSliders
            principal={principal}
            tenureDays={tenureDays}
            onPrincipalChange={setPrincipal}
            onTenureChange={setTenureDays}
          />
          <div className="rounded-xl bg-slate-50 p-4 text-sm ring-1 ring-slate-200/70 ring-inset">
            <p className="mb-2 font-semibold text-slate-700">Applying as</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
              <span>{profile.fullName}</span>
              <span className="font-mono">{profile.pan}</span>
              <span>{EMPLOYMENT_MODE_LABELS[profile.employmentMode]}</span>
              <span>{formatCurrency(profile.monthlySalary)}/month</span>
            </div>
          </div>
        </div>
        <QuoteSummary principal={principal} tenureDays={tenureDays} />
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
        <Button variant="ghost" onClick={onBack} icon={<ArrowLeft className="size-4" />}>
          Back
        </Button>
        <Button size="lg" loading={submitting} onClick={apply} icon={<Send className="size-4" />}>
          Apply for {formatCurrency(principal)}
        </Button>
      </div>
    </div>
  );
}
