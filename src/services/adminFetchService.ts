import { prisma } from "../db/client";
import { Prisma, ReportReason, ReportStatus } from "../generated/prisma/client";

class AdminFetchService {
  async getUsers(page = 1, limit = 20, q?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { profile: { displayName: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          active: true,
          suspended: true,
          createdAt: true,
          profile: { select: { avatarUrl: true, displayName: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPosts(page = 1, limit = 20, q?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { author: { username: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {};

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImageUrl: true,
          createdAt: true,
          isDeleted: true,
          published: true,
          suspended: true,
          userId: true,
          author: {
            select: {
              id: true,
              username: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReports(page = 1, limit = 20, q?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.ReportWhereInput = {};

    if (q) {
      const qUpper = q.toUpperCase();

      // Type-safe check for Enums
      const isReason = Object.values(ReportReason).includes(
        qUpper as ReportReason,
      );
      const isStatus = Object.values(ReportStatus).includes(
        qUpper as ReportStatus,
      );

      where.OR = [
        { reporter: { username: { contains: q, mode: "insensitive" } } },
        { reportedUser: { username: { contains: q, mode: "insensitive" } } },
        { message: { contains: q, mode: "insensitive" } },
      ];

      if (isReason) where.OR.push({ reason: qUpper as ReportReason });
      if (isStatus) where.OR.push({ status: qUpper as ReportStatus });

      // Only check UUID fields if q looks like a UUID to avoid DB errors in some strict environments
      if (q.length === 36) {
        where.OR.push({ id: q }, { postId: q }, { commentId: q });
      }
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          reason: true,
          status: true,
          message: true,
          createdAt: true,
          reporter: { select: { id: true, username: true } },
          reportedUser: { select: { id: true, username: true } },
          postId: true,
          commentId: true,
        },
      }),
      prisma.report.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const adminFetchService = new AdminFetchService();
