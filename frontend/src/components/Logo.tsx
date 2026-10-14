import Link from "next/link";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 shadow-sm shadow-brand-600/30",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 17l5-5 4 4 7-8" />
        <path d="M15 8h5v5" />
      </svg>
    </span>
  );
}

export function Logo({ href = "/", inverted = false, className }: { href?: string; inverted?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className={cn("text-lg font-bold tracking-tight", inverted ? "text-white" : "text-slate-900")}>
        Loan<span className={inverted ? "text-brand-300" : "text-brand-600"}>Flow</span>
      </span>
    </Link>
  );
}
