import prisma from "../config/prisma.js";

export class ReviewService {
  static async create(authorId: string, targetId: string, rating: number, comment?: string) {
    if (authorId === targetId) throw new Error("Cannot review yourself");
    if (rating < 1 || rating > 5) throw new Error("Rating must be 1-5");

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new Error("User not found");

    const existing = await prisma.review.findFirst({
      where: { authorId, targetId },
    });
    if (existing) throw new Error("You already reviewed this user");

    return prisma.review.create({
      data: { authorId, targetId, rating, comment, status: "PENDING" },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  static async getForUser(targetId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total, aggregations] = await Promise.all([
      prisma.review.findMany({
        where: { targetId, status: "APPROVED" },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      }),
      prisma.review.count({ where: { targetId, status: "APPROVED" } }),
      prisma.review.aggregate({
        where: { targetId, status: "APPROVED" },
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

  static async delete(reviewId: string, userId: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new Error("Review not found");
    if (review.authorId !== userId) throw new Error("Not your review");
    await prisma.review.delete({ where: { id: reviewId } });
  }
}
