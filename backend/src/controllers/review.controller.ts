import { Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service.js";
import { AuthRequest } from "../types/index.js";

export class ReviewController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { targetId, rating, comment } = req.body;
      if (!targetId || !rating) {
        res.status(400).json({ message: "targetId and rating are required" }); return;
      }
      const review = await ReviewService.create(req.user!.userId, targetId, rating, comment);
      res.status(201).json({ message: "Review created (pending approval)", review });
    } catch (err) { next(err); }
  }

  static async getForUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const result = await ReviewService.getForUser(req.params.userId, page, limit);
      res.json(result);
    } catch (err) { next(err); }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ReviewService.delete(req.params.id, req.user!.userId);
      res.json({ message: "Review deleted" });
    } catch (err) { next(err); }
  }
}
