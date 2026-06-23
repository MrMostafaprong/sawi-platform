import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AuthPayload, AuthRequest } from "../types/index.js";

if (env.JWT_SECRET.length < 32) {
  console.warn("JWT_SECRET is less than 32 characters — consider using a stronger secret");
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized: no token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};
