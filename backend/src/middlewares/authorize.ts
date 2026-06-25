import { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/index.js";
export type UserRole = "admin" | "user" | "guest";

export const authorize = (...roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "غير مصرح" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "لا تملك الصلاحية" });
      return;
    }
    next();
  };
