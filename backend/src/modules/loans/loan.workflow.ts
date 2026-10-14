import { Types } from "mongoose";
import { LOAN_STATUS_TRANSITIONS, type LoanStatus } from "../../constants/loan";
import { Loan, type ILoan, type LoanDocument } from "../../models/Loan";
import { ApiError } from "../../utils/ApiError";

const TIMESTAMP_FIELD: Partial<Record<LoanStatus, keyof ILoan>> = {
  SANCTIONED: "sanctionedAt",
  REJECTED: "rejectedAt",
  DISBURSED: "disbursedAt",
  CLOSED: "closedAt",
};

export function canTransition(from: LoanStatus, to: LoanStatus): boolean {
  return LOAN_STATUS_TRANSITIONS[from].includes(to);
}

function assertTransition(from: LoanStatus, to: LoanStatus): void {
  if (!canTransition(from, to)) {
    throw ApiError.conflict(`A loan in ${from} status cannot be moved to ${to}`);
  }
}

interface TransitionOptions {
  actorId?: string;
  note?: string;
  /** Extra fields to set together with the status change. */
  set?: Partial<Pick<ILoan, "rejectionReason">>;
}

/**
 * Atomically moves a loan from `from` to `to`. The status is part of the
 * update filter, so two executives acting on the same loan cannot both succeed.
 */
export async function transitionLoanStatus(
  loanId: string,
  from: LoanStatus,
  to: LoanStatus,
  { actorId, note, set }: TransitionOptions = {},
): Promise<LoanDocument> {
  assertTransition(from, to);

  const now = new Date();
  const timestampField = TIMESTAMP_FIELD[to];

  const loan = await Loan.findOneAndUpdate(
    { _id: loanId, status: from },
    {
      $set: { ...set, status: to, ...(timestampField ? { [timestampField]: now } : {}) },
      $push: { statusHistory: { status: to, changedBy: actorId, note, changedAt: now } },
    },
    { returnDocument: "after", runValidators: true },
  );

  if (loan) return loan;

  const existing = await Loan.findById(loanId).select("status").lean();
  if (!existing) throw ApiError.notFound("Loan not found");
  throw ApiError.conflict(`This loan is already ${existing.status}; it cannot be moved to ${to}`);
}

/** Applies a status change to a loaded document (used inside transactions). */
export function applyStatusChange(
  loan: LoanDocument,
  to: LoanStatus,
  { actorId, note }: Omit<TransitionOptions, "set"> = {},
): void {
  assertTransition(loan.status, to);

  const now = new Date();
  const timestampField = TIMESTAMP_FIELD[to];

  loan.status = to;
  if (timestampField) loan.set(timestampField, now);
  loan.statusHistory.push({
    status: to,
    changedBy: actorId ? new Types.ObjectId(actorId) : undefined,
    note,
    changedAt: now,
  });
}
