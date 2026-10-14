import { Schema } from "mongoose";
import { EMPLOYMENT_MODES, type EmploymentMode } from "../constants/loan";

/** Personal details captured in step 2 of the borrower journey. */
export interface IApplicantDetails {
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
}

/** Metadata of an uploaded salary slip; the file itself lives in UPLOAD_DIR. */
export interface IStoredFile {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export const applicantDetailsFields = {
  fullName: { type: String, required: true, trim: true },
  pan: { type: String, required: true, uppercase: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  monthlySalary: { type: Number, required: true, min: 0 },
  employmentMode: { type: String, enum: EMPLOYMENT_MODES, required: true },
} as const;

export const storedFileSchema = new Schema<IStoredFile>(
  {
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);
