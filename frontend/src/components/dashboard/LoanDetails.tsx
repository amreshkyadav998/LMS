"use client";

import { ExternalLink, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { LoanStatusBadge, LOAN_STATUS_TONES } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Avatar, DetailList } from "@/components/ui/misc";
import { EMPLOYMENT_MODE_LABELS, LOAN_STATUS_LABELS, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate, formatDateTime, formatFileSize } from "@/lib/format";
import { calculateAge } from "@/lib/loan";
import type { Loan } from "@/types";

export function ApplicantCell({ loan }: { loan: Loan }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={loan.applicant.fullName} className="size-8 text-[11px]" />
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900">{loan.applicant.fullName}</p>
        <p className="truncate text-xs text-slate-500">{loan.borrower?.email}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
      {children}
    </section>
  );
}

const DOT_CLASSES = {
  slate: "bg-slate-400",
  brand: "bg-brand-500",
  blue: "bg-sky-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
  teal: "bg-teal-500",
} as const;

function StatusTimeline({ loan }: { loan: Loan }) {
  return (
    <ol className="space-y-4">
      {[...loan.statusHistory].reverse().map((change, index) => {
        const actor = typeof change.changedBy === "object" ? change.changedBy : undefined;
        return (
          <li key={`${change.status}-${index}`} className="relative flex gap-3">
            <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", DOT_CLASSES[LOAN_STATUS_TONES[change.status]])} />
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-slate-900">
                {LOAN_STATUS_LABELS[change.status]}
                <span className="ml-2 font-normal text-slate-400">{formatDateTime(change.changedAt)}</span>
              </p>
              {actor && (
                <p className="text-xs text-slate-500">
                  by {actor.name} · {ROLE_LABELS[actor.role]}
                </p>
              )}
              {change.note && <p className="mt-1 text-slate-600">{change.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

interface LoanDetailsModalProps {
  loan: Loan | null;
  onClose: () => void;
  footer?: ReactNode;
  children?: ReactNode;
}

/** Full loan view used across the dashboard modules; module-specific actions go in `footer`. */
export function LoanDetailsModal({ loan, onClose, footer, children }: LoanDetailsModalProps) {
  if (!loan) return null;
  const { applicant } = loan;

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={
        <span className="flex items-center gap-3">
          {applicant.fullName} <LoanStatusBadge status={loan.status} />
        </span>
      }
      description={`Loan ref ${loan._id.slice(-8).toUpperCase()} · Applied ${formatDate(loan.createdAt)}`}
      footer={footer}
    >
      <div className="space-y-7">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Principal", formatCurrency(loan.principal)],
            ["Tenure", `${loan.tenureDays} days`],
            ["Interest", formatCurrency(loan.simpleInterest)],
            ["Total repayment", formatCurrency(loan.totalRepayment)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/70 ring-inset">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-0.5 font-bold text-slate-900 tabular-nums">{value}</p>
            </div>
          ))}
        </div>

        {children}

        {loan.rejectionReason && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200 ring-inset">
            <span className="font-semibold">Rejection reason:</span> {loan.rejectionReason}
          </div>
        )}

        <Section title="Applicant details">
          <DetailList
            items={[
              { label: "Full name", value: applicant.fullName },
              { label: "Email", value: loan.borrower?.email ?? "—" },
              { label: "PAN", value: <span className="font-mono">{applicant.pan}</span> },
              {
                label: "Date of birth",
                value: `${formatDate(applicant.dateOfBirth)} (${calculateAge(new Date(applicant.dateOfBirth))} yrs)`,
              },
              { label: "Monthly salary", value: formatCurrency(applicant.monthlySalary) },
              { label: "Employment", value: EMPLOYMENT_MODE_LABELS[applicant.employmentMode] },
            ]}
          />
        </Section>

        <Section title="Salary slip">
          <a
            href={`/api/loans/${loan._id}/salary-slip`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl p-3 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:ring-brand-300"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FileText className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-900">{loan.salarySlip.originalName}</span>
              <span className="block text-xs text-slate-500">{formatFileSize(loan.salarySlip.size)}</span>
            </span>
            <ExternalLink className="size-4 text-slate-400 group-hover:text-brand-600" />
          </a>
        </Section>

        <Section title="Activity">
          <StatusTimeline loan={loan} />
        </Section>
      </div>
    </Modal>
  );
}
