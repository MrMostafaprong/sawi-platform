import prisma from "../config/prisma.js";
import crypto from "crypto";
import type { GroupMemberRole, GroupVisibility } from "../../generated/prisma/enums.js";
import type { Prisma } from "../../generated/prisma/client.js";

export class GroupService {
  static async create(data: {
    name: string; description?: string; visibility: GroupVisibility; creatorId: string;
  }) {
    const userGroupCount = await prisma.group.count({ where: { creatorId: data.creatorId } });
    if (userGroupCount >= 4) throw new Error("لقد وصلت للحد الأقصى (4 مجموعات)");

    if (data.visibility === "FEMALE_ONLY") {
      const creator = await prisma.user.findUnique({ where: { id: data.creatorId }, select: { gender: true } });
      if (creator?.gender !== "FEMALE") {
        throw new Error("فقط المستخدمات الإناث يمكنهن إنشاء مجموعات نسائية");
      }
    }

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9_\-\u0600-\u06FF]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) + "-" + crypto.randomUUID().slice(0, 8);

    const existing = await prisma.group.findUnique({ where: { slug } });
    if (existing) throw new Error("اسم المجموعة مستخدم بالفعل");

    return prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          name: data.name,
          description: data.description,
          slug,
          visibility: data.visibility,
          creatorId: data.creatorId,
        },
      });

      await tx.groupMember.create({
        data: { groupId: group.id, userId: data.creatorId, role: "OWNER" as GroupMemberRole },
      });

      return group;
    });
  }

  static async getById(groupId: string, userId?: string) {
    const [group, viewer] = await Promise.all([
      prisma.group.findUnique({
        where: { id: groupId },
        include: {
          creator: { select: { id: true, username: true, displayName: true, avatarUrl: true, gender: true } },
          members: {
            include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
            orderBy: { joinedAt: "asc" },
          },
          _count: { select: { members: true, follows: true } },
        },
      }),
      userId ? prisma.user.findUnique({ where: { id: userId }, select: { id: true, gender: true } }) : null,
    ]);

    if (!group) return null;

    if (group.visibility === "FEMALE_ONLY") {
      if (!userId || !viewer) throw new Error("هذه المجموعة مخصصة للنساء فقط");
      if (group.creatorId !== userId && viewer.gender !== "FEMALE") {
        throw new Error("هذه المجموعة مخصصة للنساء فقط");
      }
    }

    const isMember = userId ? group.members.some((m) => m.userId === userId) : false;
    const myRole = userId ? group.members.find((m) => m.userId === userId)?.role || null : null;
    const isFollowing = userId ? !!(await prisma.groupFollow.findUnique({
      where: { groupId_userId: { groupId, userId } },
    })) : false;

    return { ...group, isMember, myRole, isFollowing };
  }

  static async update(groupId: string, userId: string, data: {
    name?: string; description?: string; visibility?: GroupVisibility;
  }) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new Error("Group not found");
    if (group.creatorId !== userId) throw new Error("Only the creator can edit this group");

    const updateData: Prisma.GroupUpdateInput = {}
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = data.name
        .toLowerCase().replace(/[^a-z0-9_\-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.visibility) updateData.visibility = data.visibility;

    return prisma.group.update({ where: { id: groupId }, data: updateData });
  }

  static async delete(groupId: string, userId: string) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new Error("Group not found");
    if (group.creatorId !== userId) throw new Error("Only the creator can delete this group");

    await prisma.group.delete({ where: { id: groupId } });
  }

  static async join(groupId: string, userId: string) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new Error("Group not found");

    if (group.visibility === "FEMALE_ONLY") {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { gender: true } });
      if (user?.gender !== "FEMALE") {
        throw new Error("هذه المجموعة مخصصة للنساء فقط");
      }
    }

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (existing) throw new Error("Already a member");

    return prisma.groupMember.create({
      data: { groupId, userId, role: "MEMBER" as GroupMemberRole },
    });
  }

  static async leave(groupId: string, userId: string) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new Error("Group not found");

    if (group.creatorId === userId) {
      const count = await prisma.groupMember.count({ where: { groupId } });
      if (count <= 1) {
        await prisma.group.delete({ where: { id: groupId } });
        return { deleted: true };
      }
      const nextOwner = await prisma.groupMember.findFirst({
        where: { groupId, userId: { not: userId } },
        orderBy: { joinedAt: "asc" },
      });
      if (nextOwner) {
        await prisma.groupMember.update({
          where: { id: nextOwner.id },
          data: { role: "OWNER" },
        });
      }
    }

    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });

    const remaining = await prisma.groupMember.count({ where: { groupId } });
    if (remaining === 0) {
      await prisma.group.delete({ where: { id: groupId } });
      return { deleted: true };
    }

    return { deleted: false };
  }

  static async search(filters: {
    query?: string; skill?: string; city?: string; gender?: string;
    visibility?: string; page?: number; limit?: number;
  }, userId?: string) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: "insensitive" } },
        { description: { contains: filters.query, mode: "insensitive" } },
      ];
    }
    if (filters.visibility) {
      where.visibility = filters.visibility;
    } else if (userId) {
      const viewer = await prisma.user.findUnique({ where: { id: userId }, select: { gender: true } });
      if (viewer?.gender !== "FEMALE") {
        where.visibility = { not: "FEMALE_ONLY" };
      }
    }
    if (filters.skill) {
      where.creator = { skills: { has: filters.skill } };
    }
    if (filters.city) {
      where.creator = Object.assign({}, where.creator, { city: { contains: filters.city, mode: "insensitive" } });
    }
    if (filters.gender) {
      where.creator = Object.assign({}, where.creator, { gender: filters.gender });
    }

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { id: true, username: true, displayName: true, avatarUrl: true, gender: true, city: true } },
          _count: { select: { members: true } },
        },
      }),
      prisma.group.count({ where }),
    ]);

    return { groups, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async listMyGroups(userId: string) {
    return prisma.group.findMany({
      where: { members: { some: { userId } } },
      include: {
        creator: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { members: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async follow(groupId: string, userId: string) {
    const group = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true, visibility: true, creatorId: true } });
    if (!group) throw new Error("Group not found");

    if (group.visibility === "FEMALE_ONLY" && group.creatorId !== userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { gender: true } });
      if (user?.gender !== "FEMALE") throw new Error("هذه المجموعة مخصصة للنساء فقط");
    }

    const existing = await prisma.groupFollow.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (existing) throw new Error("Already following this group");

    return prisma.groupFollow.create({
      data: { groupId, userId },
    });
  }

  static async unfollow(groupId: string, userId: string) {
    const existing = await prisma.groupFollow.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!existing) throw new Error("Not following this group");

    await prisma.groupFollow.delete({
      where: { groupId_userId: { groupId, userId } },
    });
  }

  static async createGroupReview(groupId: string, userId: string, rating: number, comment?: string) {
    if (rating < 1 || rating > 5) throw new Error("Rating must be 1-5");

    const group = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true } });
    if (!group) throw new Error("Group not found");

    const existing = await prisma.groupReview.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (existing) throw new Error("You already reviewed this group");

    return prisma.groupReview.create({
      data: { groupId, userId, rating, comment },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  static async getGroupReviews(groupId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total, aggregations] = await Promise.all([
      prisma.groupReview.findMany({
        where: { groupId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      }),
      prisma.groupReview.count({ where: { groupId } }),
      prisma.groupReview.aggregate({
        where: { groupId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      avgRating: aggregations._avg.rating || 0,
      reviewCount: aggregations._count.rating,
    };
  }
}
