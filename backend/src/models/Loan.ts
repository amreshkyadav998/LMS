import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";
import { ALL_LOAN_STATUSES, LOAN_STATUS, type LoanStatus } from "../constants/loan";
import { roundCurrency } from "../utils/money";
import { applicantDetailsFields, storedFileSchema, type IApplicantDetails, type IStoredFile } from "./shared";

export interface IStatusChange {
  status: LoanStatus;
  changedBy?: Types.ObjectId;
  note?: string;
  changedAt: Date;
}

export interface ILoan {
  borrower: Types.ObjectId;
  /** Snapshot of the applicant's details at the time of applying. */
  applicant: IApplicantDetails;
  salarySlip: IStoredFile;
  principal: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  amountPaid: number;
  status: LoanStatus;
  rejectionReason?: string;
  statusHistory: IStatusChange[];
  sanctionedAt?: Date;
  rejectedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoanVirtuals {
  outstandingAmount: number;
}

type LoanModel = Model<ILoan, object, object, ILoanVirtuals>;
export type LoanDocument = HydratedDocument<ILoan, ILoanVirtuals>;

const statusChangeSchema = new Schema<IStatusChange>(
  {
    status: { type: String, enum: ALL_LOAN_STATUSES, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: { type: String, trim: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const applicantSchema = new Schema<IApplicantDetails>(applicantDetailsFields, { _id: false });

const loanSchema = new Schema<ILoan, LoanModel, object, object, ILoanVirtuals>(
  {
    borrower: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    applicant: { type: applicantSchema, required: true },
    salarySlip: { type: storedFileSchema, required: true },
    principal: { type: Number, required: true, min: 0 },
    tenureDays: { type: Number, required: true, min: 1 },
    interestRate: { type: Number, required: true },
    simpleInterest: { type: Number, required: true, min: 0 },
    totalRepayment: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ALL_LOAN_STATUSES, default: LOAN_STATUS.APPLIED },
    rejectionReason: { type: String, trim: true },
    statusHistory: { type: [statusChangeSchema], default: [] },
    sanctionedAt: Date,
    rejectedAt: Date,
    disbursedAt: Date,
    closedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
  },
);

loanSchema.virtual("outstandingAmount").get(function outstandingAmount(this: ILoan) {
  return Math.max(0, roundCurrency(this.totalRepayment - this.amountPaid));
});

loanSchema.index({ status: 1, createdAt: -1 });
loanSchema.index({ "applicant.fullName": 1 });
loanSchema.index({ "applicant.pan": 1 });

export const Loan = model<ILoan, LoanModel>("Loan", loanSchema);
