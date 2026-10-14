import type { ReactNode } from "react";
import { LOAN_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { LoanStatus } from "@/types";

export type BadgeTone = "slate" | "brand" | "blue" | "amber" | "emerald" | "rose" | "violet" | "teal";

const TONE_CLASSES: Record<BadgeTone, { badge: string; dot: string }> = {
  slate: { badge: "bg-slate-100 text-slate-700 ring-slate-500/15", dot: "bg-slate-400" },
  brand: { badge: "bg-brand-50 text-brand-700 ring-brand-600/15", dot: "bg-brand-500" },
  blue: { badge: "bg-sky-50 text-sky-700 ring-sky-600/15", dot: "bg-sky-500" },
  amber: { badge: "bg-amber-50 text-amber-800 ring-amber-600/20", dot: "bg-amber-500" },
  emerald: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", dot: "bg-emerald-500" },
  rose: { badge: "bg-rose-50 text-rose-700 ring-rose-600/15", dot: "bg-rose-500" },
  violet: { badge: "bg-violet-50 text-violet-700 ring-violet-600/15", dot: "bg-violet-500" },
  teal: { badge: "bg-teal-50 text-teal-700 ring-teal-600/15", dot: "bg-teal-500" },
};

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "slate", dot = false, className, children }: BadgeProps) {
  const classes = TONE_CLASSES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        classes.badge,
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", classes.dot)} />}
      {children}
    </span>
  );
}

export const LOAN_STATUS_TONES: Record<LoanStatus, BadgeTone> = {
  APPLIED: "blue",
  SANCTIONED: "amber",
  REJECTED: "rose",
  DISBURSED: "violet",
  CLOSED: "emerald",
};

export function LoanStatusBadge({ status, className }: { status: LoanStatus; className?: string }) {
  return (
    <Badge tone={LOAN_STATUS_TONES[status]} dot className={className}>
      {LOAN_STATUS_LABELS[status]}
    </Badge>
  );
}
