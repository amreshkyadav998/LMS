import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  hint?: ReactNode;
}

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-stone-500">{label}</p>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cream text-black ring-1 ring-stone-200">
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-2 truncate text-xl font-bold tracking-tight text-black tabular-nums sm:text-2xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}
