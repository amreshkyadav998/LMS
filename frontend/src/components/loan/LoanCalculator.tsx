"use client";

import type { CSSProperties, ReactNode } from "react";
import { LOAN_LIMITS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { calculateLoanQuote } from "@/lib/loan";

interface SliderFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
}

function SliderField({ id, label, value, min, max, step, display, minLabel, maxLabel, onChange }: SliderFieldProps) {
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-stone-600">
          {label}
        </label>
        <span className="rounded-lg bg-brand-50 px-3 py-1 text-base font-bold text-brand-700 tabular-nums">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-slider"
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
      <div className="mt-2 flex justify-between text-xs font-medium text-stone-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

interface LoanSlidersProps {
  principal: number;
  tenureDays: number;
  onPrincipalChange: (value: number) => void;
  onTenureChange: (value: number) => void;
}

export function LoanSliders({ principal, tenureDays, onPrincipalChange, onTenureChange }: LoanSlidersProps) {
  return (
    <div className="space-y-8">
      <SliderField
        id="principal"
        label="Loan amount"
        value={principal}
        min={LOAN_LIMITS.MIN_PRINCIPAL}
        max={LOAN_LIMITS.MAX_PRINCIPAL}
        step={LOAN_LIMITS.PRINCIPAL_STEP}
        display={formatCurrency(principal)}
        minLabel="₹50K"
        maxLabel="₹5L"
        onChange={onPrincipalChange}
      />
      <SliderField
        id="tenure"
        label="Tenure"
        value={tenureDays}
        min={LOAN_LIMITS.MIN_TENURE_DAYS}
        max={LOAN_LIMITS.MAX_TENURE_DAYS}
        step={1}
        display={`${tenureDays} days`}
        minLabel="30 days"
        maxLabel="365 days"
        onChange={onTenureChange}
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="font-semibold text-black tabular-nums">{value}</span>
    </div>
  );
}

/** Live repayment breakdown using the same simple-interest formula as the API. */
export function QuoteSummary({ principal, tenureDays }: { principal: number; tenureDays: number }) {
  const quote = calculateLoanQuote(principal, tenureDays);

  return (
    <div className="rounded-2xl bg-cream p-4 ring-1 ring-stone-200/70 ring-inset sm:p-5">
      <div className="divide-y divide-stone-200/70">
        <SummaryRow label="Principal amount" value={formatCurrency(quote.principal)} />
        <SummaryRow label="Interest rate" value={`${quote.interestRate}% p.a. (simple)`} />
        <SummaryRow label="Tenure" value={`${quote.tenureDays} days`} />
        <SummaryRow label="Interest payable" value={formatCurrency(quote.simpleInterest)} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-stone-200/70">
        <span className="text-sm font-semibold whitespace-nowrap text-stone-700">Total repayment</span>
        <span className="text-lg font-bold whitespace-nowrap text-brand-700 tabular-nums sm:text-xl">{formatCurrency(quote.totalRepayment)}</span>
      </div>
      <p className="mt-3 text-center text-[11px] text-stone-400">
        SI = (P × R × T) / (365 × 100) · T = tenure in days
      </p>
    </div>
  );
}
