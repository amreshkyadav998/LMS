import { z } from "zod";
import { paginationQuerySchema } from "../../utils/pagination";

export const LEAD_STAGES = ["REGISTERED", "DETAILS_SUBMITTED", "SLIP_UPLOADED"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const leadsQuerySchema = paginationQuerySchema.extend({
  stage: z.enum(LEAD_STAGES).optional(),
});

export type LeadsQuery = z.infer<typeof leadsQuerySchema>;
