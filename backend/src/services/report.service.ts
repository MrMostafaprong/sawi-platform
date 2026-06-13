import prisma from "../config/prisma.js";

export class ReportService {
  static async create(reporterId: string, targetId: string, reason: string, description?: string) {
    if (reporterId === targetId) throw new Error("Cannot report yourself");

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new Error("User not found");

    const existing = await prisma.report.findFirst({
      where: { reporterId, targetId, status: "PENDING" },
    });
    if (existing) throw new Error("You already reported this user");

    return prisma.report.create({
      data: { reporterId, targetId, reason, description },
      include: {
        reporter: { select: { id: true, username: true } },
        target: { select: { id: true, username: true, displayName: true } },
      },
    });
  }

  static async getMyReports(reporterId: string) {
    return prisma.report.findMany({
      where: { reporterId },
      include: {
        target: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
