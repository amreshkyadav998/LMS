import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("min-w-full divide-y divide-slate-100 text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("bg-slate-50/80", className)} {...props} />;
}

export function TBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-slate-100 bg-white", className)} {...props} />;
}

export function TR({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("transition-colors hover:bg-slate-50/70", className)} {...props} />;
}

export function TH({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 text-left text-[11px] font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6",
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn("px-4 py-3.5 whitespace-nowrap text-slate-700 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6", className)}
      {...props}
    />
  );
}
