import type { Request, Response } from "express";
import { requireUser } from "../../middleware/auth";
import { resolveUploadPath } from "../../middleware/upload";
import { sendSuccess } from "../../utils/http";
import * as loanService from "./loan.service";

export async function getLoan(req: Request<{ loanId: string }>, res: Response) {
  sendSuccess(res, { loan: await loanService.getLoanById(req.params.loanId) });
}

export async function viewSalarySlip(req: Request<{ loanId: string }>, res: Response) {
  const slip = await loanService.getSalarySlipForViewer(req.params.loanId, requireUser(req));

  res.setHeader("Content-Type", slip.mimeType);
  res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(slip.originalName)}`);
  res.sendFile(resolveUploadPath(slip.fileName), (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({ success: false, message: "File not found" });
    }
  });
}
