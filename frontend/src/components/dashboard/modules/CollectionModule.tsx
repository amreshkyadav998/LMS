"use client";

import { CircleDollarSign, Hash, IndianRupee, Receipt, Wallet } from "lucide-react";
import { useState, type FormEvent } from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ApplicantCell, LoanDetailsModal } from "@/components/dashboard/LoanDetails";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { ProgressBar, SearchInput, Tabs } from "@/components/ui/misc";
import { Spinner } from "@/components/ui/Spinner";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { api, errorMessage, fetcher } from "@/lib/api";
import { UTR_REGEX } from "@/lib/constants";
import { formatCurrency, formatDate, toDateInputValue } from "@/lib/format";
import { roundCurrency } from "@/lib/loan";
import type { Loan, Payment } from "@/types";

type CollectionTab = "DISBURSED" | "CLOSED";

interface PaymentFormErrors {
  utr?: string;
  amount?: string;
  paymentDate?: string;
  form?: string;
}

function RecordPaymentForm({ loan, onRecorded }: { loan: Loan; onRecorded: () => Promise<void> }) {
  const [utr, setUtr] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => toDateInputValue());
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): PaymentFormErrors {
    const next: PaymentFormErrors = {};
    const value = Number(amount);
    if (!UTR_REGEX.test(utr)) next.utr = "UTR must be 12–22 letters or digits";
    if (!amount || Number.isNaN(value) || value <= 0) next.amount = "Enter an amount greater than zero";
    else if (roundCurrency(value) !== value) next.amount = "Amount can have at most 2 decimal places";
    else if (value > loan.outstandingAmount) {
      next.amount = `Amount cannot exceed the outstanding ${formatCurrency(loan.outstandingAmount)}`;
    }
    if (!paymentDate) next.paymentDate = "Select the payment date";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await api<{ loan: Loan; payment: Payment }>(`/collection/loans/${loan._id}/payments`, {
        method: "POST",
        body: { utr, amount: Number(amount), paymentDate },
      });
      if (result.loan.status === "CLOSED") {
        toast.success("Final payment received. Loan closed automatically.");
      } else {
        toast.success(`Payment of ${formatCurrency(result.payment.amount)} recorded`);
      }
      setUtr("");
      setAmount("");
      setErrors({});
      await onRecorded();
    } catch (err) {
      const message = errorMessage(err);
      setErrors(message.toLowerCase().includes("utr") ? { utr: message } : { form: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl bg-cream p-4 ring-1 ring-stone-200/70 ring-inset sm:p-5">
      <h3 className="mb-4 text-sm font-semibold text-black">Record a payment</h3>
      {errors.form && <Alert tone="error" className="mb-4">{errors.form}</Alert>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="UTR number" htmlFor="utr" error={errors.utr}>
          <Input
            id="utr"
            placeholder="e.g. HDFC2410150001"
            className="font-mono uppercase"
            maxLength={22}
            value={utr}
            onChange={(event) => setUtr(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            leading={<Hash className="size-4" />}
            invalid={Boolean(errors.utr)}
          />
        </Field>
        <Field
          label="Amount"
          htmlFor="amount"
          error={errors.amount}
          hint={
            <button
              type="button"
              className="font-semibold text-brand-600 hover:text-brand-700"
              onClick={() => setAmount(String(loan.outstandingAmount))}
            >
              Use full outstanding
            </button>
          }
        >
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            leading={<IndianRupee className="size-4" />}
            invalid={Boolean(errors.amount)}
          />
        </Field>
        <Field label="Payment date" htmlFor="paymentDate" error={errors.paymentDate}>
          <Input
            id="paymentDate"
            type="date"
            min={loan.disbursedAt ? toDateInputValue(new Date(loan.disbursedAt)) : undefined}
            max={toDateInputValue()}
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
            invalid={Boolean(errors.paymentDate)}
          />
        </Field>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit" loading={submitting} icon={<Receipt className="size-4" />}>
          Record payment
        </Button>
      </div>
    </form>
  );
}

const paymentsKey = (loanId: string) => `/collection/loans/${loanId}/payments`;

function PaymentHistory({ loanId }: { loanId: string }) {
  const { data, isLoading } = useSWR<{ payments: Payment[] }>(paymentsKey(loanId), fetcher);

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-black">Payment history</h3>
      {isLoading ? (
        <div className="flex justify-center py-6 text-brand-600">
          <Spinner />
        </div>
      ) : !data?.payments.length ? (
        <p className="rounded-xl bg-cream px-4 py-6 text-center text-sm text-stone-500">No payments recorded yet.</p>
      ) : (
        <ul className="divide-y divide-stone-100 rounded-xl ring-1 ring-stone-200">
          {data.payments.map((payment) => (
            <li key={payment._id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-sm font-semibold text-black">{payment.utr}</p>
                <p className="text-xs text-stone-500">
                  {formatDate(payment.paymentDate)}
                  {payment.recordedBy && ` · recorded by ${payment.recordedBy.name}`}
                </p>
              </div>
              <span className="font-semibold whitespace-nowrap text-emerald-600 tabular-nums">+{formatCurrency(payment.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RepaymentSummary({ loan }: { loan: Loan }) {
  const percent = (loan.amountPaid / loan.totalRepayment) * 100;
  return (
    <div className="rounded-2xl p-4 ring-1 ring-stone-200 sm:p-5">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-stone-500">Total due</p>
          <p className="mt-0.5 font-bold text-black tabular-nums">{formatCurrency(loan.totalRepayment)}</p>
        </div>
        <div>
          <p className="text-stone-500">Paid</p>
          <p className="mt-0.5 font-bold text-emerald-600 tabular-nums">{formatCurrency(loan.amountPaid)}</p>
        </div>
        <div>
          <p className="text-stone-500">Outstanding</p>
          <p className="mt-0.5 font-bold text-black tabular-nums">{formatCurrency(loan.outstandingAmount)}</p>
        </div>
      </div>
      <ProgressBar value={percent} className="mt-4" />
      <p className="mt-2 text-xs text-stone-500">{Math.floor(percent)}% repaid</p>
    </div>
  );
}

function CollectionLoanModal({ loan, onClose, onChanged }: { loan: Loan; onClose: () => void; onChanged: () => void }) {
  const [current, setCurrent] = useState(loan);

  // Reload the populated loan (balance, status, history) and its payments after each payment.
  async function refresh() {
    const { loan: fresh } = await api<{ loan: Loan }>(`/loans/${loan._id}`);
    setCurrent(fresh);
    await mutate(paymentsKey(loan._id));
    onChanged();
  }

  return (
    <LoanDetailsModal loan={current} onClose={onClose}>
      <RepaymentSummary loan={current} />
      {current.status === "DISBURSED" ? (
        <RecordPaymentForm
          loan={current}
          onRecorded={refresh}
        />
      ) : (
        <Alert tone="success" title="Loan closed">
          Fully repaid{current.closedAt ? ` on ${formatDate(current.closedAt)}` : ""}.
        </Alert>
      )}
      <PaymentHistory loanId={current._id} />
    </LoanDetailsModal>
  );
}

export function CollectionModule() {
  const [tab, setTab] = useState<CollectionTab>("DISBURSED");
  const list = usePaginatedList<Loan>("/collection/loans", { status: tab });
  const [selected, setSelected] = useState<Loan | null>(null);

  const columns: Column<Loan>[] = [
    { header: "Borrower", cell: (loan) => <ApplicantCell loan={loan} /> },
    { header: "Disbursed on", cell: (loan) => (loan.disbursedAt ? formatDate(loan.disbursedAt) : "—") },
    {
      header: "Repayment",
      cell: (loan) => (
        <div className="w-36 max-w-full">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-semibold text-emerald-600">{formatCurrency(loan.amountPaid)}</span>
            <span className="text-stone-400">{Math.floor((loan.amountPaid / loan.totalRepayment) * 100)}%</span>
          </div>
          <ProgressBar value={(loan.amountPaid / loan.totalRepayment) * 100} className="h-1.5" />
        </div>
      ),
    },
    {
      header: "Outstanding",
      cell: (loan) => (
        <div>
          <p className="font-semibold text-black">{formatCurrency(loan.outstandingAmount)}</p>
          <p className="text-xs text-stone-500">of {formatCurrency(loan.totalRepayment)}</p>
        </div>
      ),
    },
    {
      header: "Actions",
      isAction: true,
      className: "text-right",
      cell: (loan) =>
        loan.status === "DISBURSED" ? (
          <Button size="sm" icon={<CircleDollarSign className="size-3.5" />} onClick={() => setSelected(loan)}>
            Record payment
          </Button>
        ) : (
          <Button variant="secondary" size="sm" icon={<Receipt className="size-3.5" />} onClick={() => setSelected(loan)}>
            Payments
          </Button>
        ),
    },
  ];

  return (
    <>
      <PageHeader title="Collection" description="Track repayments on disbursed loans and record payments." />
      <Card>
        <CardHeader
          title={
            <Tabs
              value={tab}
              onChange={(value) => {
                setTab(value);
                list.setPage(1);
              }}
              options={[
                { value: "DISBURSED", label: "Active loans" },
                { value: "CLOSED", label: "Closed loans" },
              ]}
            />
          }
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
          empty={{
            icon: Wallet,
            title: tab === "DISBURSED" ? "No active loans" : "No closed loans yet",
            description:
              tab === "DISBURSED"
                ? "Disbursed loans awaiting repayment will appear here."
                : "Loans are closed automatically once fully repaid.",
          }}
        />
      </Card>

      {selected && (
        <CollectionLoanModal
          key={selected._id}
          loan={selected}
          onClose={() => setSelected(null)}
          onChanged={() => void list.mutate()}
        />
      )}
    </>
  );
}
