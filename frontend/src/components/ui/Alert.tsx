import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "warning" | "error";

const TONES: Record<Tone, { classes: string; icon: typeof Info }> = {
  info: { classes: "bg-brand-50 text-brand-900 ring-brand-200", icon: Info },
  success: { classes: "bg-emerald-50 text-emerald-800 ring-emerald-200", icon: CheckCircle2 },
  warning: { classes: "bg-amber-50 text-amber-800 ring-amber-200", icon: AlertTriangle },
  error: { classes: "bg-rose-50 text-rose-800 ring-rose-200", icon: XCircle },
};

interface AlertProps {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Alert({ tone = "info", title, children, className }: AlertProps) {
  const { classes, icon: Icon } = TONES[tone];
  return (
    <div role="alert" className={cn("flex gap-3 rounded-xl p-4 text-sm ring-1 ring-inset", classes, className)}>
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="opacity-90">{children}</div>}
      </div>
    </div>
  );
}
