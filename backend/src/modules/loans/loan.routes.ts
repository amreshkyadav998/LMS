import { Router } from "express";
import { ROLES, STAFF_ROLES } from "../../constants/roles";
import { authenticate, authorize } from "../../middleware/auth";
import { validateObjectId } from "../../middleware/validateObjectId";
import * as controller from "./loan.controller";

export const loanRouter = Router();

loanRouter.use(authenticate);

loanRouter.get("/:loanId", validateObjectId("loanId"), authorize(...STAFF_ROLES), controller.getLoan);
loanRouter.get(
  "/:loanId/salary-slip",
  validateObjectId("loanId"),
  authorize(...STAFF_ROLES, ROLES.BORROWER),
  controller.viewSalarySlip,
);
