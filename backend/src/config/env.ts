import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DB_NAME: z.string().min(1).default("lms"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  UPLOAD_DIR: z.string().default("uploads"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
};
