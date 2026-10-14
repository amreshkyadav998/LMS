"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { LoanSliders, QuoteSummary } from "@/components/loan/LoanCalculator";

export function HeroCalculator() {
  const [principal, setPrincipal] = useState(200_000);
  const [tenureDays, setTenureDays] = useState(180);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-brand-600 uppercase">Loan calculator</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">Plan your repayment</h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
          12% p.a. fixed
        </span>
      </div>
      <LoanSliders
        principal={principal}
        tenureDays={tenureDays}
        onPrincipalChange={setPrincipal}
        onTenureChange={setTenureDays}
      />
      <div className="mt-7">
        <QuoteSummary principal={principal} tenureDays={tenureDays} />
      </div>
      <ButtonLink href="/signup" size="lg" className="mt-6 w-full">
        Apply for this loan <ArrowRight className="size-4" />
      </ButtonLink>
    </div>
  );
}
