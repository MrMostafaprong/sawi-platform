import { Request } from "express";

export type UserRole = "ADMIN" | "USER" | "FREELANCER";

export interface AuthPayload {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
  sessionId?: string;
  params: Record<string, string>;
}
