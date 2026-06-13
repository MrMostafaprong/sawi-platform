import { Response, NextFunction } from "express";
import { GroupService } from "../services/group.service.js";
import { AuthRequest } from "../types/index.js";

export class GroupController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, description, visibility } = req.body;
      if (!name || !visibility) {
        res.status(400).json({ message: "الاسم والخصوصية مطلوبان" });
        return;
      }
      const group = await GroupService.create({ name, description, visibility, creatorId: req.user!.userId });
      res.status(201).json({ message: "تم إنشاء المجموعة", group });
    } catch (err) { next(err); }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await GroupService.getById(req.params.id, req.user?.userId);
      if (!group) { res.status(404).json({ message: "المجموعة غير موجودة" }); return; }
      res.json({ group });
    } catch (err) { next(err); }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await GroupService.update(req.params.id, req.user!.userId, req.body);
      res.json({ message: "تم تحديث المجموعة", group });
    } catch (err) { next(err); }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await GroupService.delete(req.params.id, req.user!.userId);
      res.json({ message: "تم حذف المجموعة" });
    } catch (err) { next(err); }
  }

  static async join(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const membership = await GroupService.join(req.params.id, req.user!.userId);
      res.json({ message: "تم الانضمام للمجموعة", membership });
    } catch (err) { next(err); }
  }

  static async leave(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await GroupService.leave(req.params.id, req.user!.userId);
      res.json({ message: result.deleted ? "تم حذف المجموعة (لا يوجد أعضاء)" : "تم المغادرة" });
    } catch (err) { next(err); }
  }

  static async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { query, skill, city, gender, visibility, page, limit } = req.query;
      const result = await GroupService.search({
        query: query as string,
        skill: skill as string,
        city: city as string,
        gender: gender as string,
        visibility: visibility as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      }, req.user?.userId);
      res.json(result);
    } catch (err) { next(err); }
  }

  static async myGroups(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const groups = await GroupService.listMyGroups(req.user!.userId);
      res.json({ groups });
    } catch (err) { next(err); }
  }

  static async follow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await GroupService.follow(req.params.id, req.user!.userId);
      res.json({ message: "تم متابعة المجموعة" });
    } catch (err) { next(err); }
  }

  static async unfollow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await GroupService.unfollow(req.params.id, req.user!.userId);
      res.json({ message: "تم إلغاء متابعة المجموعة" });
    } catch (err) { next(err); }
  }

  static async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { rating, comment } = req.body;
      if (!rating) { res.status(400).json({ message: "Rating is required" }); return; }
      const review = await GroupService.createGroupReview(req.params.id, req.user!.userId, rating, comment);
      res.status(201).json({ message: "تم إضافة التقييم", review });
    } catch (err) { next(err); }
  }

  static async getReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const result = await GroupService.getGroupReviews(req.params.id, page);
      res.json(result);
    } catch (err) { next(err); }
  }
}
