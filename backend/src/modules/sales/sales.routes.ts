import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authenticate, authorizeModule } from "../../middleware/auth";
import * as controller from "./sales.controller";

export const salesRouter = Router();

salesRouter.use(authenticate, authorizeModule(ROLES.SALES));

salesRouter.get("/leads", controller.listLeads);
