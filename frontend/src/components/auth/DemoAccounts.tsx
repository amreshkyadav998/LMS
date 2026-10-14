"use client";

import { ChevronDown, KeyRound } from "lucide-react";
import { useState } from "react";
import { ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { Role } from "@/types";

interface DemoAccount {
  role: Role;
  email: string;
  password: string;
}

/** Accounts created by `npm run seed` in the backend — handy for evaluating each role. */
const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: "admin", email: "admin@lms.dev", password: "Admin@123" },
  { role: "sales", email: "sales@lms.dev", password: "Sales@123" },
  { role: "sanction", email: "sanction@lms.dev", password: "Sanction@123" },
  { role: "disbursement", email: "disbursement@lms.dev", password: "Disburse@123" },
  { role: "collection", email: "collection@lms.dev", password: "Collect@123" },
  { role: "borrower", email: "borrower@lms.dev", password: "Borrower@123" },
];

export function DemoAccounts({ onSelect }: { onSelect: (account: DemoAccount) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-cream">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <KeyRound className="size-4 text-brand-600" /> Demo accounts
        </span>
        <ChevronDown className={cn("size-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="grid gap-2 px-3 pb-3 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              onClick={() => onSelect(account)}
              className="rounded-xl bg-white px-3 py-2.5 text-left ring-1 ring-slate-200 transition hover:ring-brand-300 hover:shadow-sm"
            >
              <span className="block text-xs font-semibold text-black">{ROLE_LABELS[account.role]}</span>
              <span className="block truncate text-xs text-slate-500">{account.email}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
