import { z } from "zod";
import { LOAN_STATUS, UTR_REGEX } from "../../constants/loan";
import { endOfToday } from "../../utils/date";
import { paginationQuerySchema } from "../../utils/pagination";
import { roundCurrency } from "../../utils/money";

export const recordPaymentSchema = z.object({
  utr: z
    .string()
    .trim()
    .toUpperCase()
    .regex(UTR_REGEX, "UTR must be 12–22 letters or digits"),
  amount: z.coerce
    .number({ error: "Enter a valid amount" })
    .positive("Amount must be greater than zero")
    .refine((value) => roundCurrency(value) === value, "Amount can have at most 2 decimal places"),
  paymentDate: z.coerce
    .date({ error: "Enter a valid payment date" })
    .refine((date) => date <= endOfToday(), "Payment date cannot be in the future"),
});

export const collectionQuerySchema = paginationQuerySchema.extend({
  status: z.enum([LOAN_STATUS.DISBURSED, LOAN_STATUS.CLOSED]).default(LOAN_STATUS.DISBURSED),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
