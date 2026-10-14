import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/http";
import * as adminService from "./admin.service";

export async function getOverview(_req: Request, res: Response) {
  sendSuccess(res, await adminService.getOverview());
}
