import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface StepperProps {
  steps: { title: string; description: string }[];
  current: number;
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="grid grid-cols-3 gap-2 sm:gap-4">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.title} className="flex flex-col gap-3">
            <span className={cn("h-1 rounded-full transition-colors", done || active ? "bg-brand-600" : "bg-slate-200")} />
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done && "bg-brand-600 text-white",
                  active && "bg-brand-50 text-brand-700 ring-2 ring-brand-600",
                  !done && !active && "bg-slate-100 text-slate-400",
                )}
              >
                {done ? <Check className="size-4" /> : index + 1}
              </span>
              <div className="hidden min-w-0 sm:block">
                <p className={cn("truncate text-sm font-semibold", done || active ? "text-slate-900" : "text-slate-400")}>
                  {step.title}
                </p>
                <p className="truncate text-xs text-slate-500">{step.description}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
