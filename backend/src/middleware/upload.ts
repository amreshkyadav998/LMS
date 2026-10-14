import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../config/env";
import { SALARY_SLIP } from "../constants/loan";
import { ApiError } from "../utils/ApiError";

export const UPLOAD_ROOT = path.resolve(env.UPLOAD_DIR);
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const EXTENSION_BY_MIME: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const storage = multer.diskStorage({
  destination: UPLOAD_ROOT,
  // Never trust the client's file name; store under a random name.
  filename: (_req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${EXTENSION_BY_MIME[file.mimetype] ?? ""}`);
  },
});

export const salarySlipUpload = multer({
  storage,
  limits: { fileSize: SALARY_SLIP.MAX_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if ((SALARY_SLIP.ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(ApiError.badRequest("Only PDF, JPG or PNG files are allowed"));
    }
  },
}).single("salarySlip");

export function resolveUploadPath(fileName: string): string {
  // basename() guards against path traversal through a tampered file name.
  return path.join(UPLOAD_ROOT, path.basename(fileName));
}

export async function removeUpload(fileName: string): Promise<void> {
  await fs.promises.rm(resolveUploadPath(fileName), { force: true });
}
