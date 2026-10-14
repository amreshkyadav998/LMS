import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  console.log(`MongoDB connected (database: ${env.MONGODB_DB_NAME})`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
