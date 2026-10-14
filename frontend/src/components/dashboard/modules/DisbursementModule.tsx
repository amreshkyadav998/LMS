"use client";

import { Banknote, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ApplicantCell, LoanDetailsModal } from "@/components/dashboard/LoanDetails";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/misc";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { api, errorMessage } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Loan } from "@/types";

function DisburseModal({ loan, onClose, onDisbursed }: { loan: Loan; onClose: () => void; onDisbursed: () => void }) {
  const [submitting, setSubmitting] = useState(false);

  async function disburse() {
    setSubmitting(true);
    try {
      await api(`/disbursement/loans/${loan._id}/disburse`, { method: "PATCH" });
      toast.success(`${formatCurrency(loan.principal)} disbursed to ${loan.applicant.fullName}`);
      onDisbursed();
    } catch (err) {
      toast.error(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Confirm disbursement"
      description="This marks the funds as released to the borrower."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={submitting} onClick={disburse} icon={<Send className="size-4" />}>
            Mark as disbursed
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-stone-200 bg-cream p-5">
          <p className="text-sm text-stone-500">Amount to release</p>
          <p className="mt-1 text-3xl font-bold text-black tabular-nums">{formatCurrency(loan.principal)}</p>
          <p className="mt-3 text-sm text-stone-500">
            to <span className="font-semibold text-black">{loan.applicant.fullName}</span> · PAN {loan.applicant.pan}
          </p>
        </div>
        <Alert tone="info">
          After disbursement the loan moves to <strong>Collection</strong>, where repayments of{" "}
          <strong>{formatCurrency(loan.totalRepayment)}</strong> will be tracked.
        </Alert>
      </div>
    </Modal>
  );
}

export function DisbursementModule() {
  const list = usePaginatedList<Loan>("/disbursement/loans");
  const [selected, setSelected] = useState<Loan | null>(null);
  const [disbursing, setDisbursing] = useState<Loan | null>(null);

  const columns: Column<Loan>[] = [
    { header: "Applicant", cell: (loan) => <ApplicantCell loan={loan} /> },
    {
      header: "Amount",
      cell: (loan) => <span className="font-semibold text-black">{formatCurrency(loan.principal)}</span>,
    },
    { header: "Tenure", cell: (loan) => `${loan.tenureDays} days` },
    { header: "Total repayment", cell: (loan) => formatCurrency(loan.totalRepayment) },
    { header: "Sanctioned on", cell: (loan) => (loan.sanctionedAt ? formatDate(loan.sanctionedAt) : "—") },
    {
      header: "Actions",
      isAction: true,
      className: "text-right",
      cell: (loan) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setSelected(loan)}>
            View
          </Button>
          <Button size="sm" icon={<Send className="size-3.5" />} onClick={() => setDisbursing(loan)}>
            Disburse
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Disbursement" description="Release funds for sanctioned loans." />
      <Card>
        <CardHeader
          title="Ready for disbursement"
          description={list.data ? `${list.data.total} sanctioned loan(s) awaiting payout` : "Loading…"}
          action={
            <SearchInput
              placeholder="Search by name or PAN"
              value={list.search}
              onChange={(event) => list.setSearch(event.target.value)}
            />
          }
        />
        <DataTable
          data={list.data}
          error={list.error}
          isLoading={list.isLoading}
          columns={columns}
          rowKey={(loan) => loan._id}
          onPageChange={list.setPage}
          empty={{ icon: Banknote, title: "Nothing to disburse", description: "Sanctioned loans will appear here." }}
        />
      </Card>

      <LoanDetailsModal
        loan={selected}
        onClose={() => setSelected(null)}
        footer={
          selected && (
            <Button
              icon={<Send className="size-4" />}
              onClick={() => {
                setDisbursing(selected);
                setSelected(null);
              }}
            >
              Disburse
            </Button>
          )
        }
      />

      {disbursing && (
        <DisburseModal
          loan={disbursing}
          onClose={() => setDisbursing(null)}
          onDisbursed={() => {
            setDisbursing(null);
            void list.mutate();
          }}
        />
      )}
    </>
  );
}
