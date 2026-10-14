import { connectDatabase, disconnectDatabase } from "./config/db";
import { env } from "./config/env";
import { createApp } from "./app";

async function bootstrap() {
  await connectDatabase();

  const server = createApp().listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
