import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  if (!env.isProduction) app.use(morgan("dev"));

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
