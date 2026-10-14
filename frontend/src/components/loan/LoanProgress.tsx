import { Check, X } from "lucide-react";
import { Fragment } from "react";
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

  // Fixed-width steps sit at both edges of the card, with flexible connectors
  // between them, so the tracker lines up with the content above and below.
  return (
    <ol className="flex w-full items-start">
      {steps.map((step, index) => {
        const done = index <= currentIndex;
        const isRejectedStep = step.status === "REJECTED";
        const date = loan[step.dateKey] as string | undefined;
        const isLast = index === steps.length - 1;

        return (
          <Fragment key={step.status}>
            <li className="flex w-20 shrink-0 flex-col items-center text-center">
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
              <span className={cn("mt-2 text-xs font-semibold", done ? "text-black" : "text-slate-400")}>
                {step.label}
              </span>
              <span className="text-[11px] whitespace-nowrap text-slate-400">{date && done ? formatDate(date) : "—"}</span>
            </li>
            {!isLast && (
              <li
                aria-hidden="true"
                className={cn(
                  "-mx-6 mt-[15px] h-0.5 flex-1 rounded-full",
                  index < currentIndex ? "bg-brand-600" : "bg-slate-200",
                )}
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}
