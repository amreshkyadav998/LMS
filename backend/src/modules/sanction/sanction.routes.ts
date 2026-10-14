import { Router } from "express";
import { z } from "zod";
import { ROLES } from "../../constants/roles";
import { authenticate, authorizeModule } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { validateObjectId } from "../../middleware/validateObjectId";
import * as controller from "./sanction.controller";

const rejectSchema = z.object({
  reason: z.string().trim().min(5, "Please give a reason of at least 5 characters").max(500),
});

export const sanctionRouter = Router();

sanctionRouter.use(authenticate, authorizeModule(ROLES.SANCTION));

sanctionRouter.get("/loans", controller.listApplications);
sanctionRouter.patch("/loans/:loanId/approve", validateObjectId("loanId"), controller.approve);
sanctionRouter.patch(
  "/loans/:loanId/reject",
  validateObjectId("loanId"),
  validateBody(rejectSchema),
  controller.reject,
);
