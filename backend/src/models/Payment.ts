import { Schema, model, type Types } from "mongoose";

export interface IPayment {
  loan: Types.ObjectId;
  /** Unique bank transaction reference. */
  utr: string;
  amount: number;
  paymentDate: Date;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    loan: { type: Schema.Types.ObjectId, ref: "Loan", required: true, index: true },
    utr: { type: String, required: true, unique: true, uppercase: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentDate: { type: Date, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Payment = model<IPayment>("Payment", paymentSchema);
