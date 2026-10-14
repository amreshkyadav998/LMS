import type { Request, Response } from "express";
import { requireUser } from "../../middleware/auth";
import { ApiError } from "../../utils/ApiError";
import { sendSuccess } from "../../utils/http";
import * as borrowerService from "./borrower.service";

export async function getOverview(req: Request, res: Response) {
  sendSuccess(res, await borrowerService.getOverview(requireUser(req).id));
}

export async function savePersonalDetails(req: Request, res: Response) {
  const profile = await borrowerService.savePersonalDetails(requireUser(req).id, req.body);
  sendSuccess(res, { profile });
}

export async function uploadSalarySlip(req: Request, res: Response) {
  if (!req.file) throw ApiError.badRequest("Please attach your salary slip (PDF, JPG or PNG)");
  const profile = await borrowerService.saveSalarySlip(requireUser(req).id, req.file);
  sendSuccess(res, { profile });
}

export async function applyForLoan(req: Request, res: Response) {
  const loan = await borrowerService.applyForLoan(requireUser(req).id, req.body);
  sendSuccess(res, { loan }, 201);
}
