import mongoose from "mongoose";
import { LOAN_STATUS } from "../../constants/loan";
import { Loan } from "../../models/Loan";
import { Payment } from "../../models/Payment";
import { ApiError } from "../../utils/ApiError";
import { startOfDay } from "../../utils/date";
import { formatInr, roundCurrency } from "../../utils/money";
import { applyStatusChange } from "../loans/loan.workflow";
import type { RecordPaymentInput } from "./collection.schema";

export async function listPayments(loanId: string) {
  if (!(await Loan.exists({ _id: loanId }))) throw ApiError.notFound("Loan not found");

  return Payment.find({ loan: loanId })
    .sort({ paymentDate: -1, createdAt: -1 })
    .populate("recordedBy", "name");
}

/**
 * Records a repayment against a disbursed loan.
 *
 * Runs in a transaction so the payment insert and the loan's running balance
 * always change together. Concurrent payments on the same loan conflict on the
 * loan document and are retried, so the outstanding-balance check can't be raced.
 * When the balance reaches zero the loan is closed automatically.
 */
export async function recordPayment(loanId: string, input: RecordPaymentInput, actorId: string) {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      const loan = await Loan.findById(loanId).session(session);
      if (!loan) throw ApiError.notFound("Loan not found");

      if (loan.status !== LOAN_STATUS.DISBURSED) {
        throw ApiError.conflict(`Payments can only be recorded for disbursed loans (this loan is ${loan.status})`);
      }

      const outstanding = loan.outstandingAmount;
      if (input.amount > outstanding) {
        throw ApiError.unprocessable(`Amount exceeds the outstanding balance of ${formatInr(outstanding)}`);
      }

      if (loan.disbursedAt && input.paymentDate.getTime() < startOfDay(loan.disbursedAt).getTime()) {
        throw ApiError.badRequest("Payment date cannot be before the disbursement date");
      }

      if (await Payment.exists({ utr: input.utr }).session(session)) {
        throw ApiError.conflict(`A payment with UTR ${input.utr} has already been recorded`);
      }

      const [payment] = await Payment.create(
        [{ loan: loan._id, utr: input.utr, amount: input.amount, paymentDate: input.paymentDate, recordedBy: actorId }],
        { session },
      );

      loan.amountPaid = roundCurrency(loan.amountPaid + input.amount);
      if (loan.amountPaid >= loan.totalRepayment) {
        applyStatusChange(loan, LOAN_STATUS.CLOSED, { actorId, note: "Fully repaid — closed automatically" });
      }
      await loan.save({ session });

      return { payment, loan };
    });
  } finally {
    await session.endSession();
  }
}
