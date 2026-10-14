"use client";

import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ApplicantCell, LoanDetailsModal } from "@/components/dashboard/LoanDetails";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/misc";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { api, errorMessage } from "@/lib/api";
import { EMPLOYMENT_MODE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Loan } from "@/types";

const MIN_REASON_LENGTH = 5;

function RejectModal({ loan, onClose, onRejected }: { loan: Loan; onClose: () => void; onRejected: () => void }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reject() {
    if (reason.trim().length < MIN_REASON_LENGTH) {
      setError(`Please give a reason of at least ${MIN_REASON_LENGTH} characters`);
      return;
    }
    setSubmitting(true);
    try {
      await api(`/sanction/loans/${loan._id}/reject`, { method: "PATCH", body: { reason } });
      toast.success(`Application from ${loan.applicant.fullName} rejected`);
      onRejected();
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Reject application"
      description={`${loan.applicant.fullName} · ${formatCurrency(loan.principal)} for ${loan.tenureDays} days`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={submitting} onClick={reject}>
            Reject application
          </Button>
        </>
      }
    >
      <Field
        label="Reason for rejection"
        htmlFor="reason"
        error={error ?? undefined}
        hint="The borrower will see this reason on their dashboard."
      >
        <Textarea
          id="reason"
          autoFocus
          maxLength={500}
          placeholder="e.g. Salary slip could not be verified"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setError(null);
          }}
          invalid={Boolean(error)}
        />
      </Field>
    </Modal>
  );
}

export function SanctionModule() {
  const list = usePaginatedList<Loan>("/sanction/loans");
  const [selected, setSelected] = useState<Loan | null>(null);
  const [rejecting, setRejecting] = useState<Loan | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function approve(loan: Loan) {
    setApprovingId(loan._id);
    try {
      await api(`/sanction/loans/${loan._id}/approve`, { method: "PATCH" });
      toast.success(`Loan for ${loan.applicant.fullName} sanctioned`);
      setSelected(null);
      await list.mutate();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setApprovingId(null);
    }
  }

  const columns: Column<Loan>[] = [
    { header: "Applicant", cell: (loan) => <ApplicantCell loan={loan} /> },
    { header: "PAN", cell: (loan) => <span className="font-mono text-xs">{loan.applicant.pan}</span> },
    {
      header: "Salary",
      cell: (loan) => (
        <div>
          <p className="font-medium text-black">{formatCurrency(loan.applicant.monthlySalary)}</p>
          <p className="text-xs text-stone-500">{EMPLOYMENT_MODE_LABELS[loan.applicant.employmentMode]}</p>
        </div>
      ),
    },
    {
      header: "Requested",
      cell: (loan) => (
        <div>
          <p className="font-semibold text-black">{formatCurrency(loan.principal)}</p>
          <p className="text-xs text-stone-500">{loan.tenureDays} days</p>
        </div>
      ),
    },
    { header: "Applied on", cell: (loan) => formatDate(loan.createdAt) },
    {
      header: "Actions",
      isAction: true,
      className: "text-right",
      cell: (loan) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setSelected(loan)}>
            Review
          </Button>
          <Button
            variant="success"
            size="sm"
            loading={approvingId === loan._id}
            onClick={() => approve(loan)}
          >
            Approve
          </Button>
          <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setRejecting(loan)}>
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Sanction"
        description="Review submitted applications and approve or reject them."
      />
      <Card>
        <CardHeader
          title="Pending applications"
          description={list.data ? `${list.data.total} awaiting review · oldest first` : "Loading…"}
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
          empty={{ icon: ClipboardCheck, title: "All caught up!", description: "There are no applications waiting for review." }}
        />
      </Card>

      <LoanDetailsModal
        loan={selected}
        onClose={() => setSelected(null)}
        footer={
          selected && (
            <>
              <Button
                variant="danger"
                icon={<XCircle className="size-4" />}
                onClick={() => {
                  setRejecting(selected);
                  setSelected(null);
                }}
              >
                Reject
              </Button>
              <Button
                variant="success"
                loading={approvingId === selected._id}
                icon={<CheckCircle2 className="size-4" />}
                onClick={() => approve(selected)}
              >
                Approve & sanction
              </Button>
            </>
          )
        }
      />

      {rejecting && (
        <RejectModal
          loan={rejecting}
          onClose={() => setRejecting(null)}
          onRejected={() => {
            setRejecting(null);
            void list.mutate();
          }}
        />
      )}
    </>
  );
}
