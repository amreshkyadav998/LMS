import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authenticate, authorizeModule } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { validateObjectId } from "../../middleware/validateObjectId";
import * as controller from "./collection.controller";
import { recordPaymentSchema } from "./collection.schema";

export const collectionRouter = Router();

collectionRouter.use(authenticate, authorizeModule(ROLES.COLLECTION));

collectionRouter.get("/loans", controller.listLoansForCollection);
collectionRouter.get("/loans/:loanId/payments", validateObjectId("loanId"), controller.listPayments);
collectionRouter.post(
  "/loans/:loanId/payments",
  validateObjectId("loanId"),
  validateBody(recordPaymentSchema),
  controller.recordPayment,
);
