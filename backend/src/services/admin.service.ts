import prisma from "../config/prisma.js";

export class AdminService {
  static async getPendingReports(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { status: "PENDING" },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { id: true, username: true, displayName: true } },
          target: { select: { id: true, username: true, displayName: true, avatarUrl: true, email: true } },
        },
      }),
      prisma.report.count({ where: { status: "PENDING" } }),
    ]);
    return { reports, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async resolveReport(reportId: string, action: "RESOLVED" | "DISMISSED") {
    return prisma.report.update({
      where: { id: reportId },
      data: { status: action },
    });
  }

  static async banUser(userId: string, adminId: string) {
    if (userId === adminId) throw new Error("Cannot ban yourself");
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) throw new Error("User not found");
    if (target.role === "ADMIN") throw new Error("Cannot ban another admin");
    await prisma.user.update({
      where: { id: userId },
      data: { status: "BANNED" },
    });
  }

  static async unbanUser(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });
  }

  static async getPendingImages(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.portfolioItem.findMany({
        where: { isApproved: false, type: "IMAGE" },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          portfolio: {
            include: { user: { select: { id: true, username: true, displayName: true } } },
          },
        },
      }),
      prisma.portfolioItem.count({ where: { isApproved: false, type: "IMAGE" } }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async approveImage(itemId: string) {
    return prisma.portfolioItem.update({
      where: { id: itemId },
      data: { isApproved: true },
    });
  }

  static async rejectImage(itemId: string) {
    return prisma.portfolioItem.update({
      where: { id: itemId },
      data: { isApproved: false },
    });
  }

  static async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, username: true, displayName: true, role: true, status: true, gender: true, createdAt: true },
      }),
      prisma.user.count(),
    ]);
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }
}
