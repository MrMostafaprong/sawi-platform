import { Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { AuthRequest } from "../types/index.js";
import { env } from "../config/env.js";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: env.NODE_ENV === "production",
  sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: env.NODE_ENV === "production",
  sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/api/auth/refresh",
};

const clearCookieOptions = {
  httpOnly: true as const,
  sameSite: (env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
};

export class AuthController {
  static async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, username, password, gender } = req.body;
      const { user, token, refreshToken } = await AuthService.register(email, username, password, gender);
      res.cookie("token", token, ACCESS_COOKIE_OPTIONS);
      res.cookie("refresh-token", refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(201).json({ message: "Registered successfully", user });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ip = req.ip;
      const ua = req.headers["user-agent"];
      const { user, token, refreshToken } = await AuthService.login(email, password, ip, ua);
      res.cookie("token", token, ACCESS_COOKIE_OPTIONS);
      res.cookie("refresh-token", refreshToken, REFRESH_COOKIE_OPTIONS);
      res.json({ message: "Logged in successfully", user });
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.["refresh-token"];
      if (!refreshToken) {
        res.status(401).json({ message: "Refresh token not provided" });
        return;
      }
      const { token } = await AuthService.refreshToken(refreshToken);
      res.cookie("token", token, ACCESS_COOKIE_OPTIONS);
      res.json({ message: "Token refreshed successfully" });
    } catch (err) {
      next(err);
    }
  }

  static async logout(_req: AuthRequest, res: Response) {
    res.clearCookie("token", clearCookieOptions);
    res.clearCookie("refresh-token", { ...clearCookieOptions, path: "/api/auth/refresh" });
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
