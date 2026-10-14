import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import * as controller from "./auth.controller";
import { loginSchema, signupSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), controller.signup);
authRouter.post("/login", validateBody(loginSchema), controller.login);
authRouter.post("/logout", controller.logout);
authRouter.get("/me", authenticate, controller.me);
