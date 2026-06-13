import prisma from "../config/prisma.js";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { fileTypeFromFile } from "file-type";
import { fileURLToPath } from "url";
import type { Gender, PortfolioItemType } from "../../generated/prisma/enums.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../uploads");

const ARAB_CURRENCIES = ["SAR", "AED", "EGP", "KWD", "QAR", "BHD", "OMR", "JOD", "LBP", "SYP", "IQD", "YER", "LYD", "TND", "DZD", "MAD", "MRU", "SDG", "SOS", "DJF", "KMF", "MVR"];

export class ProfileService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, username: true, displayName: true,
        avatarUrl: true, bio: true, role: true, gender: true, currency: true,
        phoneNumber: true, skills: true, city: true, createdAt: true,
        portfolio: {
          include: { items: { orderBy: { order: "asc" } } },
        },
      },
    });
    return user;
  }

  static async getPublicProfile(username: string, viewerId?: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true, username: true, displayName: true,
        avatarUrl: true, bio: true, role: true, gender: true, currency: true, city: true,
        phoneNumber: true, email: true, skills: true, createdAt: true,
        portfolio: {
          include: { items: { orderBy: { order: "asc" } } },
        },
      },
    });
    if (!user) return null;
    if (viewerId === user.id) return user;
    const show = user.portfolio?.showContact ?? true;
    if (!show) {
      const { phoneNumber, email, ...rest } = user;
      return rest;
    }
    return user;
  }

  static async updateProfile(userId: string, data: {
    displayName?: string; bio?: string; phoneNumber?: string;
    skills?: string[]; gender?: Gender | null; city?: string; currency?: string;
    title?: string; description?: string;
    websiteUrl?: string; githubUrl?: string; linkedinUrl?: string;
    hourlyRate?: number; experienceYears?: number; showContact?: boolean;
  }) {
    const { title, description, websiteUrl, githubUrl, linkedinUrl, hourlyRate, experienceYears, showContact, ...userData } = data;

    if (userData.currency && !ARAB_CURRENCIES.includes(userData.currency)) {
      throw new Error("Invalid currency code");
    }

    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: userData,
        select: { id: true, email: true, username: true, displayName: true, bio: true, phoneNumber: true, gender: true, skills: true, currency: true, city: true },
      }),
      prisma.userPortfolio.upsert({
        where: { userId },
        create: { userId, title, description, websiteUrl, githubUrl, linkedinUrl, hourlyRate, experienceYears, showContact },
        update: { title, description, websiteUrl, githubUrl, linkedinUrl, hourlyRate, experienceYears, showContact },
      }),
    ]);
    return user;
  }

  static async uploadResume(userId: string, file: Express.Multer.File) {
    let portfolio = await prisma.userPortfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      portfolio = await prisma.userPortfolio.create({ data: { userId } });
    }

    const resumeUrl = `/uploads/${file.filename}`;

    await prisma.userPortfolio.update({
      where: { userId },
      data: { resumeUrl },
    });

    return { resumeUrl };
  }

  static async uploadMedia(userId: string, file: Express.Multer.File, caption?: string) {
    const filePath = file.path;
    const ft = await fileTypeFromFile(filePath);
    const mime = ft?.mime || file.mimetype;
    const isImage = mime.startsWith("image/");

    let thumbnailUrl: string | null = null;
    if (isImage) {
      const thumbName = `thumb_${file.filename}`;
      const thumbPath = path.join(uploadDir, thumbName);
      await sharp(filePath)
        .rotate()
        .resize(400, 400, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toFile(thumbPath);
      thumbnailUrl = `/uploads/${thumbName}`;
    }

    const type: PortfolioItemType = isImage ? "IMAGE" : mime.startsWith("video/") ? "VIDEO" : "LINK";

    let portfolio = await prisma.userPortfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      portfolio = await prisma.userPortfolio.create({ data: { userId } });
    }

    const maxOrder = await prisma.portfolioItem.findFirst({
      where: { portfolioId: portfolio.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const item = await prisma.portfolioItem.create({
      data: {
        portfolioId: portfolio.id,
        type,
        url: `/uploads/${file.filename}`,
        thumbnailUrl,
        caption: caption || null,
        fileSize: file.size,
        mimeType: mime,
        order: (maxOrder?.order ?? -1) + 1,
      },
    });

    return item;
  }

  static async uploadMultipleMedia(userId: string, files: Express.Multer.File[]) {
    let portfolio = await prisma.userPortfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      portfolio = await prisma.userPortfolio.create({ data: { userId } });
    }

    const maxOrder = await prisma.portfolioItem.findFirst({
      where: { portfolioId: portfolio.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    let order = (maxOrder?.order ?? -1) + 1;
    const items: any[] = [];

    for (const file of files) {
      const filePath = file.path;
      const ft = await fileTypeFromFile(filePath);
      const mime = ft?.mime || file.mimetype;
      const isImage = mime.startsWith("image/");

      let thumbnailUrl: string | null = null;
      if (isImage) {
        const thumbName = `thumb_${file.filename}`;
        const thumbPath = path.join(uploadDir, thumbName);
        await sharp(filePath)
          .rotate()
          .resize(400, 400, { fit: "cover" })
          .jpeg({ quality: 80 })
          .toFile(thumbPath);
        thumbnailUrl = `/uploads/${thumbName}`;
      }

      const type: PortfolioItemType = isImage ? "IMAGE" : mime.startsWith("video/") ? "VIDEO" : "LINK";

      const item = await prisma.portfolioItem.create({
        data: {
          portfolioId: portfolio!.id,
          type,
          url: `/uploads/${file.filename}`,
          thumbnailUrl,
          fileSize: file.size,
          mimeType: mime,
          order: order++,
        },
      });
      items.push(item);
    }

    return items;
  }

  static async addLink(userId: string, url: string, caption?: string) {
    let portfolio = await prisma.userPortfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      portfolio = await prisma.userPortfolio.create({ data: { userId } });
    }

    const maxOrder = await prisma.portfolioItem.findFirst({
      where: { portfolioId: portfolio.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    return prisma.portfolioItem.create({
      data: {
        portfolioId: portfolio.id,
        type: "LINK",
        url,
        caption: caption || null,
        order: (maxOrder?.order ?? -1) + 1,
      },
    });
  }

  static async deleteMedia(userId: string, itemId: string) {
    const item = await prisma.portfolioItem.findUnique({
      where: { id: itemId },
      include: { portfolio: { select: { userId: true } } },
    });
    if (!item || item.portfolio.userId !== userId) {
      throw new Error("Media not found");
    }

    if (item.url.startsWith("/uploads/")) {
      const f = path.join(uploadDir, path.basename(item.url));
      await fs.unlink(f).catch(() => {});
    }
    if (item.thumbnailUrl?.startsWith("/uploads/")) {
      const t = path.join(uploadDir, path.basename(item.thumbnailUrl));
      await fs.unlink(t).catch(() => {});
    }

    await prisma.portfolioItem.delete({ where: { id: itemId } });
  }

  static async toggleContactVisibility(userId: string) {
    const portfolio = await prisma.userPortfolio.findUnique({ where: { userId } });
    if (!portfolio) {
      return prisma.userPortfolio.create({ data: { userId, showContact: false } });
    }
    return prisma.userPortfolio.update({
      where: { userId },
      data: { showContact: !portfolio.showContact },
    });
  }

  static async updateAvatar(userId: string, file: Express.Multer.File) {
    const filePath = file.path;
    const thumbName = `avatar_${file.filename}`;
    const thumbPath = path.join(uploadDir, thumbName);

    await sharp(filePath)
      .rotate()
      .resize(256, 256, { fit: "cover" })
      .jpeg({ quality: 90 })
      .toFile(thumbPath);

    const old = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } });
    if (old?.avatarUrl?.startsWith("/uploads/")) {
      await fs.unlink(path.join(uploadDir, path.basename(old.avatarUrl))).catch(() => {});
    }

    await fs.unlink(filePath).catch(() => {});

    return prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: `/uploads/${thumbName}` },
      select: { avatarUrl: true },
    });
  }
}
