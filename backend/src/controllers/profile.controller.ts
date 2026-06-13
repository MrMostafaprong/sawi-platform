import { Response, NextFunction } from "express";
import { ProfileService } from "../services/profile.service.js";
import { AuthRequest } from "../types/index.js";

export class ProfileController {
  static async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await ProfileService.getProfile(req.user!.userId);
      res.json({ profile });
    } catch (err) { next(err); }
  }

  static async getPublicProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await ProfileService.getPublicProfile(req.params.username, req.user?.userId);
      if (!profile) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json({ profile });
    } catch (err) { next(err); }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await ProfileService.updateProfile(req.user!.userId, req.body);
      res.json({ message: "Profile updated", user });
    } catch (err) { next(err); }
  }

  static async uploadMedia(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file provided" });
        return;
      }
      const item = await ProfileService.uploadMedia(req.user!.userId, req.file, req.body.caption);
      res.status(201).json({ message: "Media uploaded", item });
    } catch (err) { next(err); }
  }

  static async uploadMultipleMedia(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ message: "No files provided" });
        return;
      }
      const items = await ProfileService.uploadMultipleMedia(req.user!.userId, files);
      res.status(201).json({ message: "Media uploaded", items });
    } catch (err) { next(err); }
  }

  static async addLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { url, caption } = req.body;
      if (!url) {
        res.status(400).json({ message: "URL is required" });
        return;
      }
      const item = await ProfileService.addLink(req.user!.userId, url, caption);
      res.status(201).json({ message: "Link added", item });
    } catch (err) { next(err); }
  }

  static async deleteMedia(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ProfileService.deleteMedia(req.user!.userId, req.params.id);
      res.json({ message: "Media deleted" });
    } catch (err) { next(err); }
  }

  static async toggleContactVisibility(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const portfolio = await ProfileService.toggleContactVisibility(req.user!.userId);
      res.json({ message: "Contact visibility toggled", showContact: portfolio.showContact });
    } catch (err) { next(err); }
  }

  static async updateAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file provided" });
        return;
      }
      const result = await ProfileService.updateAvatar(req.user!.userId, req.file);
      res.json({ message: "Avatar updated", avatarUrl: result.avatarUrl });
    } catch (err) { next(err); }
  }

  static async uploadResume(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file provided" });
        return;
      }
      const result = await ProfileService.uploadResume(req.user!.userId, req.file);
      res.json({ message: "تم رفع السيرة الذاتية", resumeUrl: result.resumeUrl });
    } catch (err) { next(err); }
  }
}
