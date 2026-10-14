import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authenticate, authorize } from "../../middleware/auth";
import * as controller from "./admin.controller";

export const adminRouter = Router();

adminRouter.use(authenticate, authorize(ROLES.ADMIN));

adminRouter.get("/overview", controller.getOverview);
