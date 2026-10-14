import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authenticate, authorizeModule } from "../../middleware/auth";
import { validateObjectId } from "../../middleware/validateObjectId";
import * as controller from "./disbursement.controller";

export const disbursementRouter = Router();

disbursementRouter.use(authenticate, authorizeModule(ROLES.DISBURSEMENT));

disbursementRouter.get("/loans", controller.listSanctionedLoans);
disbursementRouter.patch("/loans/:loanId/disburse", validateObjectId("loanId"), controller.disburse);
