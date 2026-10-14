import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/http";
import { leadsQuerySchema } from "./sales.schema";
import * as salesService from "./sales.service";

export async function listLeads(req: Request, res: Response) {
  sendSuccess(res, await salesService.listLeads(leadsQuerySchema.parse(req.query)));
}
