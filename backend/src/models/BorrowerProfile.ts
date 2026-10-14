import { Schema, model, type Types } from "mongoose";
import { applicantDetailsFields, storedFileSchema, type IApplicantDetails, type IStoredFile } from "./shared";

/**
 * One profile per borrower. Holds the latest eligibility-approved personal
 * details and salary slip, which are copied onto a loan when it is applied for.
 */
export interface IBorrowerProfile extends IApplicantDetails {
  user: Types.ObjectId;
  salarySlip?: IStoredFile;
  createdAt: Date;
  updatedAt: Date;
}

const borrowerProfileSchema = new Schema<IBorrowerProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    ...applicantDetailsFields,
    salarySlip: { type: storedFileSchema, required: false },
  },
  { timestamps: true },
);

export const BorrowerProfile = model<IBorrowerProfile>("BorrowerProfile", borrowerProfileSchema);
