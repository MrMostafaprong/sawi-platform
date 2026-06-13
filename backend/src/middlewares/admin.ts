import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
};
