import { Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { AuthRequest } from "../types/index.js";
import { env } from "../config/env.js";

const COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: env.NODE_ENV === "production",
  sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  static async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, username, password, gender } = req.body;
      if (!email || !username || !password) {
        res.status(400).json({ message: "Email, username, and password are required" });
        return;
      }
      const { user, token } = await AuthService.register(email, username, password, gender);
      res.cookie("token", token, COOKIE_OPTIONS);
      res.status(201).json({ message: "Registered successfully", user });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }
      const ip = req.ip;
      const ua = req.headers["user-agent"];
      const { user, token } = await AuthService.login(email, password, ip, ua);
      res.cookie("token", token, COOKIE_OPTIONS);
      res.json({ message: "Logged in successfully", user });
    } catch (err) {
      next(err);
    }
  }

  static async logout(_req: AuthRequest, res: Response) {
    res.clearCookie("token", { httpOnly: true, sameSite: COOKIE_OPTIONS.sameSite });
    res.json({ message: "Logged out successfully" });
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }
}
