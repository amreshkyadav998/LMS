"use client";

import { ArrowRight, Banknote, FileStack, HandCoins, PiggyBank, Users } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { ApplicantCell } from "@/components/dashboard/LoanDetails";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { LoanStatusBadge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatCompactCurrency, formatCurrency, formatDateTime } from "@/lib/format";
import type { AdminOverview, LoanStatus } from "@/types";

const PIPELINE: { status: LoanStatus; label: string; href?: string; bar: string }[] = [
  { status: "APPLIED", label: "Awaiting sanction", href: "/dashboard/sanction", bar: "bg-stone-400" },
  { status: "SANCTIONED", label: "Awaiting disbursement", href: "/dashboard/disbursement", bar: "bg-amber-500" },
  { status: "DISBURSED", label: "In collection", href: "/dashboard/collection", bar: "bg-brand-600" },
  { status: "CLOSED", label: "Closed", href: "/dashboard/collection", bar: "bg-emerald-500" },
  { status: "REJECTED", label: "Rejected", bar: "bg-rose-500" },
];

export function OverviewModule() {
  const { data, error, isLoading } = useSWR<AdminOverview>("/admin/overview", fetcher);

  if (isLoading) return <PageLoader />;
  if (error || !data) return <Alert tone="error" title="Could not load overview">Please refresh the page.</Alert>;

  const maxCount = Math.max(1, ...Object.values(data.loansByStatus));

  return (
    <>
      <PageHeader title="Overview" description="A snapshot of the entire lending portfolio." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-5">
        <StatCard label="Total applications" value={data.totalLoans} icon={FileStack} />
        <StatCard label="Open leads" value={data.openLeads} icon={Users} hint="Signed up, not applied" />
        <StatCard
          label="Disbursed"
          value={formatCompactCurrency(data.portfolio.disbursedPrincipal)}
          icon={Banknote}
          hint="Principal released"
        />
        <StatCard
          label="Collected"
          value={formatCompactCurrency(data.portfolio.collected)}
          icon={PiggyBank}
          hint="Repayments received"
        />
        <StatCard
          label="Outstanding"
          value={formatCompactCurrency(data.portfolio.outstanding)}
          icon={HandCoins}
          hint="Due on active loans"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardHeader title="Loan pipeline" description="Loans in each lifecycle stage." />
          <ul className="space-y-1 p-3">
            {PIPELINE.map(({ status, label, href, bar }) => {
              const count = data.loansByStatus[status];
              const content = (
                <>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-stone-700">
                        <LoanStatusBadge status={status} />
                        <span className="hidden text-stone-500 sm:inline">{label}</span>
                      </span>
                      <span className="flex items-center gap-1 font-bold text-black tabular-nums">
                        {count}
                        {href && (
                          <ArrowRight className="size-3.5 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                      <div className={cn("h-full rounded-full", bar)} style={{ width: `${(count / maxCount) * 100}%` }} />
                    </div>
                </>
              );
              const rowClasses = "group block rounded-xl px-3 py-3 transition";
              return (
                <li key={status}>
                  {href ? (
                    <Link href={href} className={cn(rowClasses, "hover:bg-cream")}>
                      {content}
                    </Link>
                  ) : (
                    <div className={rowClasses}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Recent activity" description="Most recently updated loans." />
          {data.recentLoans.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-stone-500">No loan activity yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {data.recentLoans.map((loan) => (
                <li key={loan._id} className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
                  <div className="min-w-0">
                    <ApplicantCell loan={loan} />
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="flex items-center gap-2">
                      <span className="hidden text-sm font-semibold text-black tabular-nums sm:inline">
                        {formatCurrency(loan.principal)}
                      </span>
                      <LoanStatusBadge status={loan.status} />
                    </span>
                    <span className="text-xs text-stone-500">{formatDateTime(loan.updatedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
