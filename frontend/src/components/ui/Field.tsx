import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const CONTROL_CLASSES =
  "block w-full rounded-lg border-0 bg-white px-3.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 " +
  "placeholder:text-slate-400 transition-shadow focus:ring-2 focus:ring-inset focus:ring-brand-500 focus:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const INVALID_CLASSES = "ring-rose-300 focus:ring-rose-500";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends ComponentProps<"input"> {
  invalid?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function Input({ invalid, leading, trailing, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {leading && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          {leading}
        </span>
      )}
      <input
        aria-invalid={invalid || undefined}
        className={cn(CONTROL_CLASSES, "h-11", invalid && INVALID_CLASSES, leading && "pl-10", trailing && "pr-10", className)}
        {...props}
      />
      {trailing && <span className="absolute inset-y-0 right-0 flex items-center pr-3">{trailing}</span>}
    </div>
  );
}

interface SelectProps extends ComponentProps<"select"> {
  invalid?: boolean;
}

export function Select({ invalid, className, children, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(CONTROL_CLASSES, "h-11 pr-10", invalid && INVALID_CLASSES, className)}
      {...props}
    >
      {children}
    </select>
  );
}

interface TextareaProps extends ComponentProps<"textarea"> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(CONTROL_CLASSES, "min-h-24 py-2.5", invalid && INVALID_CLASSES, className)}
      {...props}
    />
  );
}
