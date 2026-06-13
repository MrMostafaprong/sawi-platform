import prisma from "../config/prisma.js";

export class UserService {
  static async search(filters: {
    query?: string; skill?: string; city?: string; gender?: string;
    page?: number; limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters.query) {
      where.OR = [
        { username: { contains: filters.query, mode: "insensitive" } },
        { displayName: { contains: filters.query, mode: "insensitive" } },
        { bio: { contains: filters.query, mode: "insensitive" } },
      ];
    }
    if (filters.skill) {
      where.skills = { has: filters.skill };
    }
    if (filters.city) {
      where.city = { contains: filters.city, mode: "insensitive" };
    }
    if (filters.gender) {
      where.gender = filters.gender;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, username: true, displayName: true,
          avatarUrl: true, bio: true, role: true, gender: true,
          city: true, skills: true, createdAt: true,
          _count: { select: { groupMembers: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }
}
