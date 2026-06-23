import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import type { Gender } from "../../generated/prisma/enums.js";
import prisma from "../config/prisma.js";
import { env } from "../config/env.js";

const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export class AuthService {
  static async register(email: string, username: string, password: string, gender?: Gender | null) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw new Error(existing.email === email ? "Email already in use" : "Username already in use");
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, username, passwordHash, ...(gender ? { gender } : {}) },
      select: { id: true, email: true, username: true, role: true, createdAt: true },
    });

    const token = jwt.sign({ sub: user.id, role: user.role, iat: Date.now() }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as StringValue,
    });
    const refreshToken = jwt.sign({ sub: user.id, role: user.role, iat: Date.now() }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as StringValue,
    });

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt,
      },
    });

    return { user, token, refreshToken };
  }

  static async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.status === "BANNED") {
      throw new Error("Your account has been banned");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000 / 60);
      throw new Error(`Account locked. Try again in ${remaining} minute(s)`);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await prisma.loginAttempt.create({
        data: { userId: user.id, email, ipAddress, userAgent, status: "FAILED" },
      });

      const recentFailures = await prisma.loginAttempt.count({
        where: {
          userId: user.id,
          status: "FAILED",
          createdAt: { gte: new Date(Date.now() - LOCK_DURATION_MS) },
        },
      });

      if (recentFailures >= LOCK_THRESHOLD) {
        const lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        await prisma.user.update({
          where: { id: user.id },
          data: { lockedUntil: lockUntil },
        });
        throw new Error("Account locked due to too many failed attempts. Try again in 15 minutes");
      }

      throw new Error("Invalid email or password");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { lockedUntil: null },
      }),
      prisma.loginAttempt.create({
        data: { userId: user.id, email, ipAddress, userAgent, status: "SUCCESS" },
      }),
    ]);

    const token = jwt.sign({ sub: user.id, role: user.role, iat: Date.now() }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as StringValue,
    });
    const refreshToken = jwt.sign({ sub: user.id, role: user.role, iat: Date.now() }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as StringValue,
    });

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
      token,
      refreshToken,
    };
  }

  static async refreshToken(token: string) {
    let decoded: { sub: string; role: string };
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; role: string };
    } catch {
      throw new Error("Invalid or expired refresh token");
    }

    const tokenHash = hashToken(token);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored) {
      // Reuse detected — someone used a token that was already rotated
      // Revoke ALL refresh tokens for this user immediately
      await prisma.refreshToken.deleteMany({
        where: { userId: decoded.sub },
      });
      throw new Error("Refresh token reuse detected — all sessions revoked");
    }

    // Delete the used token
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true },
    });
    if (!user) throw new Error("User not found");

    const newToken = jwt.sign({ sub: user.id, role: user.role, iat: Date.now() }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as StringValue,
    });
    const newRefreshToken = jwt.sign({ sub: user.id, role: user.role, iat: Date.now() }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as StringValue,
    });

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(newRefreshToken),
        userId: user.id,
        expiresAt,
      },
    });

    return { token: newToken, refreshToken: newRefreshToken };
  }

  static async logout(token: string) {
    if (!token) return;
    const tokenHash = hashToken(token);
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, displayName: true, avatarUrl: true, bio: true, role: true, status: true, skills: true, createdAt: true },
    });
    return user;
  }
}
