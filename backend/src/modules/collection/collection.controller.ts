import type { Request, Response } from "express";
import type { SortOrder } from "mongoose";
import { LOAN_STATUS } from "../../constants/loan";
import { requireUser } from "../../middleware/auth";
import { sendSuccess } from "../../utils/http";
import { listLoans } from "../loans/loan.service";
import { collectionQuerySchema } from "./collection.schema";
import * as collectionService from "./collection.service";

export async function listLoansForCollection(req: Request, res: Response) {
  const { status, ...query } = collectionQuerySchema.parse(req.query);
  const sort: Record<string, SortOrder> = status === LOAN_STATUS.CLOSED ? { closedAt: -1 } : { disbursedAt: 1 };
  sendSuccess(res, await listLoans({ ...query, statuses: [status], sort }));
}

export async function listPayments(req: Request<{ loanId: string }>, res: Response) {
  sendSuccess(res, { payments: await collectionService.listPayments(req.params.loanId) });
}

export async function recordPayment(req: Request<{ loanId: string }>, res: Response) {
  const result = await collectionService.recordPayment(req.params.loanId, req.body, requireUser(req).id);
  sendSuccess(res, result, 201);
}
