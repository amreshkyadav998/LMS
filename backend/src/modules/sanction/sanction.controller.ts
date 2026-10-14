import type { Request, Response } from "express";
import { LOAN_STATUS } from "../../constants/loan";
import { requireUser } from "../../middleware/auth";
import { sendSuccess } from "../../utils/http";
import { paginationQuerySchema } from "../../utils/pagination";
import { transitionLoanStatus } from "../loans/loan.workflow";
import { listLoans } from "../loans/loan.service";

export async function listApplications(req: Request, res: Response) {
  const query = paginationQuerySchema.parse(req.query);
  // Oldest first: the review queue is worked in arrival order.
  sendSuccess(res, await listLoans({ ...query, statuses: [LOAN_STATUS.APPLIED], sort: { createdAt: 1 } }));
}

export async function approve(req: Request<{ loanId: string }>, res: Response) {
  const loan = await transitionLoanStatus(req.params.loanId, LOAN_STATUS.APPLIED, LOAN_STATUS.SANCTIONED, {
    actorId: requireUser(req).id,
    note: "Loan sanctioned",
  });
  sendSuccess(res, { loan });
}

export async function reject(req: Request<{ loanId: string }>, res: Response) {
  const { reason } = req.body as { reason: string };
  const loan = await transitionLoanStatus(req.params.loanId, LOAN_STATUS.APPLIED, LOAN_STATUS.REJECTED, {
    actorId: requireUser(req).id,
    note: reason,
    set: { rejectionReason: reason },
  });
  sendSuccess(res, { loan });
}
