"use client";

import { ArrowRight, FileClock, History, Sparkles } from "lucide-react";
import useSWR from "swr";
import { LoanProgress } from "@/components/loan/LoanProgress";
import { Alert } from "@/components/ui/Alert";
import { LoanStatusBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DetailList, ProgressBar } from "@/components/ui/misc";
import { PageLoader } from "@/components/ui/Spinner";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { fetcher } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { BorrowerOverview, Loan } from "@/types";

const STATUS_MESSAGES: Record<Loan["status"], string> = {
  APPLIED: "Your application is under review by our sanction team.",
  SANCTIONED: "Congratulations! Your loan is sanctioned and funds will be released shortly.",
  DISBURSED: "Funds have been released. Repayments are recorded as they are received.",
  CLOSED: "This loan is fully repaid and closed.",
  REJECTED: "Unfortunately, this application was not approved.",
};

function ActiveLoanCard({ loan }: { loan: Loan }) {
  const repaidPercent = (loan.amountPaid / loan.totalRepayment) * 100;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 bg-linear-to-br from-brand-50/80 via-white to-white px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Current loan</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {formatCurrency(loan.principal)}
            </p>
          </div>
          <LoanStatusBadge status={loan.status} className="px-3 py-1 text-sm" />
        </div>
        <p className="mt-2 text-sm text-slate-600">{STATUS_MESSAGES[loan.status]}</p>
      </div>
      <CardBody className="space-y-8">
        <LoanProgress loan={loan} />
        <DetailList
          className="sm:grid-cols-4"
          items={[
            { label: "Tenure", value: `${loan.tenureDays} days` },
            { label: "Interest rate", value: `${loan.interestRate}% p.a.` },
            { label: "Interest", value: formatCurrency(loan.simpleInterest) },
            { label: "Total repayment", value: formatCurrency(loan.totalRepayment) },
          ]}
        />
        {loan.status === "DISBURSED" && (
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/70 ring-inset">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">
                Repaid <span className="font-semibold text-slate-900">{formatCurrency(loan.amountPaid)}</span>
              </span>
              <span className="font-medium text-slate-600">
                Outstanding{" "}
                <span className="font-semibold text-slate-900">{formatCurrency(loan.outstandingAmount)}</span>
              </span>
            </div>
            <ProgressBar value={repaidPercent} />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function StartApplicationCard({ hasProfile, hasPastLoans }: { hasProfile: boolean; hasPastLoans: boolean }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -top-16 -right-16 size-56 rounded-full bg-brand-100/60 blur-2xl" />
      <CardBody className="relative flex flex-col items-start gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/25">
            <Sparkles className="size-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {hasProfile ? "Continue your loan application" : hasPastLoans ? "Apply for a new loan" : "Apply for your first loan"}
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Get from ₹50,000 up to ₹5,00,000 at a flat 12% p.a., with tenures from 30 to 365 days.
            </p>
          </div>
        </div>
        <ButtonLink href="/portal/apply" size="lg">
          {hasProfile ? "Continue" : "Start application"} <ArrowRight className="size-4" />
        </ButtonLink>
      </CardBody>
    </Card>
  );
}

function LoanHistory({ loans }: { loans: Loan[] }) {
  return (
    <Card>
      <CardHeader title="Loan history" description="All your past applications and loans." />
      {loans.length === 0 ? (
        <EmptyState icon={History} title="No past loans" description="Closed and rejected loans will appear here." />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Applied on</TH>
              <TH>Amount</TH>
              <TH>Tenure</TH>
              <TH>Total repayment</TH>
              <TH>Status</TH>
              <TH>Remarks</TH>
            </tr>
          </THead>
          <TBody>
            {loans.map((loan) => (
              <TR key={loan._id}>
                <TD>{formatDate(loan.createdAt)}</TD>
                <TD className="font-semibold text-slate-900">{formatCurrency(loan.principal)}</TD>
                <TD>{loan.tenureDays} days</TD>
                <TD>{formatCurrency(loan.totalRepayment)}</TD>
                <TD>
                  <LoanStatusBadge status={loan.status} />
                </TD>
                <TD className="max-w-xs truncate text-slate-500" title={loan.rejectionReason}>
                  {loan.rejectionReason ?? (loan.closedAt ? `Closed on ${formatDate(loan.closedAt)}` : "—")}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </Card>
  );
}

export function PortalOverview() {
  const { user } = useCurrentUser();
  const { data, error, isLoading } = useSWR<BorrowerOverview>("/borrower/overview", fetcher);

  if (isLoading) return <PageLoader />;
  if (error || !data) {
    return <Alert tone="error" title="Could not load your dashboard">Please refresh the page to try again.</Alert>;
  }

  const pastLoans = data.loans.filter((loan) => loan._id !== data.activeLoan?._id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Hello{user ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="mt-1 text-slate-500">Here’s an overview of your loans.</p>
      </div>

      {data.activeLoan ? (
        <ActiveLoanCard loan={data.activeLoan} />
      ) : (
        <StartApplicationCard hasProfile={Boolean(data.profile)} hasPastLoans={pastLoans.length > 0} />
      )}

      {data.activeLoan?.status === "APPLIED" && (
        <Alert tone="info" title="What happens next?">
          A sanction executive will review your details and salary slip. You’ll see the status update here.
        </Alert>
      )}

      {pastLoans.length > 0 || data.activeLoan ? (
        <LoanHistory loans={pastLoans} />
      ) : (
        <Card>
          <EmptyState
            icon={FileClock}
            title="No loans yet"
            description="Once you apply, you can track your loan's progress right here."
          />
        </Card>
      )}
    </div>
  );
}
