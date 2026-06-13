import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import type { Gender } from "../../generated/prisma/enums.js";
import prisma from "../config/prisma.js";
import { env } from "../config/env.js";

const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export class AuthService {
  static async register(email: string, username: string, password: string, gender?: Gender | null) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw new Error(existing.email === email ? "Email already in use" : "Username already in use");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, username, passwordHash, ...(gender ? { gender } : {}) },
      select: { id: true, email: true, username: true, role: true, createdAt: true },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as StringValue,
    });

    return { user, token };
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

    const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as StringValue,
    });

    return {
      user: { id: user.id, email: user.email, username: user.username, role: user.role },
      token,
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, displayName: true, avatarUrl: true, bio: true, role: true, status: true, skills: true, createdAt: true },
    });
    return user;
  }
}
