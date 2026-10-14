import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authenticate, authorize } from "../../middleware/auth";
import { salarySlipUpload } from "../../middleware/upload";
import { validateBody } from "../../middleware/validate";
import * as controller from "./borrower.controller";
import { loanApplicationSchema, personalDetailsSchema } from "./borrower.schema";

export const borrowerRouter = Router();

borrowerRouter.use(authenticate, authorize(ROLES.BORROWER));

borrowerRouter.get("/overview", controller.getOverview);
borrowerRouter.put("/profile", validateBody(personalDetailsSchema), controller.savePersonalDetails);
borrowerRouter.post("/salary-slip", salarySlipUpload, controller.uploadSalarySlip);
borrowerRouter.post("/loans", validateBody(loanApplicationSchema), controller.applyForLoan);
