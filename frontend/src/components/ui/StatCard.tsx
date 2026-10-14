import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "brand" | "sky" | "amber" | "violet" | "emerald" | "rose" | "slate";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-600 ring-brand-100",
  sky: "bg-sky-50 text-sky-600 ring-sky-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  hint?: ReactNode;
}

export function StatCard({ label, value, icon: Icon, tone = "brand", hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-xl ring-1", TONES[tone])}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
