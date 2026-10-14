import type { Request, Response } from "express";
import { LOAN_STATUS } from "../../constants/loan";
import { requireUser } from "../../middleware/auth";
import { sendSuccess } from "../../utils/http";
import { paginationQuerySchema } from "../../utils/pagination";
import { listLoans } from "../loans/loan.service";
import { transitionLoanStatus } from "../loans/loan.workflow";

export async function listSanctionedLoans(req: Request, res: Response) {
  const query = paginationQuerySchema.parse(req.query);
  sendSuccess(res, await listLoans({ ...query, statuses: [LOAN_STATUS.SANCTIONED], sort: { sanctionedAt: 1 } }));
}

export async function disburse(req: Request<{ loanId: string }>, res: Response) {
  const loan = await transitionLoanStatus(req.params.loanId, LOAN_STATUS.SANCTIONED, LOAN_STATUS.DISBURSED, {
    actorId: requireUser(req).id,
    note: "Funds released to borrower",
  });
  sendSuccess(res, { loan });
}
