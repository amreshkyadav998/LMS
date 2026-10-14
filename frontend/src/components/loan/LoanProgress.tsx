import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { Loan, LoanStatus } from "@/types";

const HAPPY_PATH: { status: LoanStatus; label: string; dateKey: keyof Loan }[] = [
  { status: "APPLIED", label: "Applied", dateKey: "createdAt" },
  { status: "SANCTIONED", label: "Sanctioned", dateKey: "sanctionedAt" },
  { status: "DISBURSED", label: "Disbursed", dateKey: "disbursedAt" },
  { status: "CLOSED", label: "Closed", dateKey: "closedAt" },
];

/** Horizontal lifecycle tracker: Applied → Sanctioned → Disbursed → Closed (or Rejected). */
export function LoanProgress({ loan }: { loan: Loan }) {
  const rejected = loan.status === "REJECTED";
  const steps = rejected
    ? [HAPPY_PATH[0], { status: "REJECTED" as const, label: "Rejected", dateKey: "rejectedAt" as const }]
    : HAPPY_PATH;
  const currentIndex = steps.findIndex((step) => step.status === loan.status);

  return (
    <ol className="flex w-full items-start">
      {steps.map((step, index) => {
        const done = index <= currentIndex;
        const isRejectedStep = step.status === "REJECTED";
        const date = loan[step.dateKey] as string | undefined;
        const isLast = index === steps.length - 1;

        return (
          <li key={step.status} className="relative flex flex-1 flex-col items-center">
            {!isLast && (
              <span
                className={cn(
                  "absolute top-4 left-1/2 h-0.5 w-full",
                  index < currentIndex ? "bg-brand-600" : "bg-slate-200",
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white",
                isRejectedStep
                  ? "bg-rose-600 text-white"
                  : done
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-400",
                index === currentIndex && !isRejectedStep && loan.status !== "CLOSED" && "ring-brand-100",
              )}
            >
              {isRejectedStep ? <X className="size-4" /> : done ? <Check className="size-4" /> : index + 1}
            </span>
            <span className={cn("mt-2 text-xs font-semibold", done ? "text-slate-900" : "text-slate-400")}>
              {step.label}
            </span>
            <span className="text-[11px] text-slate-400">{date && done ? formatDate(date) : "—"}</span>
          </li>
        );
      })}
    </ol>
  );
}
