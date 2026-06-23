import { Request } from "express";

export type UserRole = "ADMIN" | "USER" | "FREELANCER";

export interface AuthPayload {
  userId: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
  sessionId?: string;
  params: Record<string, string>;
}
