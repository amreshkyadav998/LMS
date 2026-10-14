import type { ReactNode } from "react";
import { LOAN_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { LoanStatus } from "@/types";

export type BadgeTone = "neutral" | "brand" | "amber" | "emerald" | "rose";

export const TONE_CLASSES: Record<BadgeTone, { badge: string; dot: string }> = {
  neutral: { badge: "bg-stone-100 text-stone-700 ring-stone-500/20", dot: "bg-stone-500" },
  brand: { badge: "bg-brand-50 text-brand-700 ring-brand-600/20", dot: "bg-brand-600" },
  amber: { badge: "bg-amber-50 text-amber-800 ring-amber-600/25", dot: "bg-amber-500" },
  emerald: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500" },
  rose: { badge: "bg-rose-50 text-rose-700 ring-rose-600/20", dot: "bg-rose-500" },
};

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", dot = false, className, children }: BadgeProps) {
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

/** One meaning per colour: neutral = waiting, amber = approved, blue = active, green = done, red = rejected. */
export const LOAN_STATUS_TONES: Record<LoanStatus, BadgeTone> = {
  APPLIED: "neutral",
  SANCTIONED: "amber",
  DISBURSED: "brand",
  CLOSED: "emerald",
  REJECTED: "rose",
};

export function LoanStatusBadge({ status, className }: { status: LoanStatus; className?: string }) {
  return (
    <Badge tone={LOAN_STATUS_TONES[status]} dot className={className}>
      {LOAN_STATUS_LABELS[status]}
    </Badge>
  );
}
