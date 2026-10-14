import { Router } from "express";
import { adminRouter } from "./modules/admin/admin.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { borrowerRouter } from "./modules/borrower/borrower.routes";
import { collectionRouter } from "./modules/collection/collection.routes";
import { disbursementRouter } from "./modules/disbursement/disbursement.routes";
import { loanRouter } from "./modules/loans/loan.routes";
import { salesRouter } from "./modules/sales/sales.routes";
import { sanctionRouter } from "./modules/sanction/sanction.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/borrower", borrowerRouter);
apiRouter.use("/loans", loanRouter);
apiRouter.use("/sales", salesRouter);
apiRouter.use("/sanction", sanctionRouter);
apiRouter.use("/disbursement", disbursementRouter);
apiRouter.use("/collection", collectionRouter);
apiRouter.use("/admin", adminRouter);
