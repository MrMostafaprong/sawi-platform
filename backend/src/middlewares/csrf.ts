import crypto from "crypto";
import { doubleCsrf } from "csrf-csrf";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import type { AuthRequest } from "../types/index.js";

const SESSION_COOKIE = "session-id";
const SAME_SITE = env.NODE_ENV === "production" ? "none" as const : "lax" as const;

export function setSessionCookie(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as AuthRequest;
  if (!req.cookies?.[SESSION_COOKIE]) {
    const sessionId = crypto.randomUUID();
    res.cookie(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: SAME_SITE,
      path: "/",
    });
    authReq.sessionId = sessionId;
  } else {
    authReq.sessionId = req.cookies[SESSION_COOKIE];
  }
  next();
}

export function getSessionIdentifier(req: Request): string {
  return (req as AuthRequest).sessionId ?? req.cookies?.[SESSION_COOKIE] ?? "";
}

const csrf = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,
  getSessionIdentifier,
  cookieName: "csrf-token",
  cookieOptions: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: SAME_SITE,
    path: "/",
  },
  size: 64,
});

export const generateCsrfToken = csrf.generateCsrfToken;
export const doubleCsrfProtection = csrf.doubleCsrfProtection;
export const invalidCsrfTokenError: Error = csrf.invalidCsrfTokenError;
