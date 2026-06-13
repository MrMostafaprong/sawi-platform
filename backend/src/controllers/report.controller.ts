import { Response, NextFunction } from "express";
import { ReportService } from "../services/report.service.js";
import { AuthRequest } from "../types/index.js";

export class ReportController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { targetId, reason, description } = req.body;
      if (!targetId || !reason) {
        res.status(400).json({ message: "targetId and reason are required" }); return;
      }
      const report = await ReportService.create(req.user!.userId, targetId, reason, description);
      res.status(201).json({ message: "Report submitted", report });
    } catch (err) { next(err); }
  }

  static async myReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reports = await ReportService.getMyReports(req.user!.userId);
      res.json({ reports });
    } catch (err) { next(err); }
  }
}
