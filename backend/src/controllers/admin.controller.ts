import { Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service.js";
import { AuthRequest } from "../types/index.js";

export class AdminController {
  static async getPendingReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const result = await AdminService.getPendingReports(page);
      res.json(result);
    } catch (err) { next(err); }
  }

  static async resolveReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { action } = req.body;
      if (!action || !["RESOLVED", "DISMISSED"].includes(action)) {
        res.status(400).json({ message: "Action must be RESOLVED or DISMISSED" }); return;
      }
      const report = await AdminService.resolveReport(req.params.id, action);
      res.json({ message: `Report ${action.toLowerCase()}`, report });
    } catch (err) { next(err); }
  }

  static async banUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await AdminService.banUser(req.params.id, req.user!.userId);
      res.json({ message: "User banned" });
    } catch (err) { next(err); }
  }

  static async unbanUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await AdminService.unbanUser(req.params.id);
      res.json({ message: "User unbanned" });
    } catch (err) { next(err); }
  }

  static async getPendingImages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const result = await AdminService.getPendingImages(page);
      res.json(result);
    } catch (err) { next(err); }
  }

  static async approveImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await AdminService.approveImage(req.params.id);
      res.json({ message: "Image approved", item });
    } catch (err) { next(err); }
  }

  static async rejectImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await AdminService.rejectImage(req.params.id);
      res.json({ message: "Image rejected", item });
    } catch (err) { next(err); }
  }

  static async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const result = await AdminService.getAllUsers(page);
      res.json(result);
    } catch (err) { next(err); }
  }
}
