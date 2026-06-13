import { Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";
import { AuthRequest } from "../types/index.js";

export class UserController {
  static async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { query, skill, city, gender, page, limit } = req.query;
      const result = await UserService.search({
        query: query as string,
        skill: skill as string,
        city: city as string,
        gender: gender as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(result);
    } catch (err) { next(err); }
  }
}
