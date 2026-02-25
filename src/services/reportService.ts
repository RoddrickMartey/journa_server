import { prisma } from "../db/client.js";
import { AppError } from "../errors/appError.js";
import { ReportReason } from "../generated/prisma/client.js"; // Removed /browser for backend compatibility

class ReportService {
  /**
   * Create a report for a User, Post, or Comment
   */
  async createReport(params: {
    reporterId: string;
    reportedUserId?: string;
    postId?: string;
    commentId?: string;
    reason: ReportReason;
    message?: string;
  }) {
    const { reporterId, reportedUserId, postId, commentId, reason, message } =
      params;

    // Check if reporter is suspended
    const reporter = await prisma.user.findUnique({
      where: { id: reporterId },
      select: { suspended: true },
    });

    if (reporter?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    // 1. Validation: Prevent self-reporting
    if (reportedUserId && reporterId === reportedUserId) {
      throw new AppError("You cannot report yourself", 400);
    }

    // 2. Validation: Ensure at least one target is provided
    if (!reportedUserId && !postId && !commentId) {
      throw new AppError("A report must target a user, post, or comment", 400);
    }

    return prisma.report.create({
      data: {
        reporterId,
        reportedUserId,
        postId,
        commentId,
        reason,
        message,
      },
    });
  }

  async getAllReports(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          reason: true,
          status: true,
          message: true,
          createdAt: true,
          postId: true, // Ensure ID is fetched
          commentId: true, // Ensure ID is fetched
          reporterId: true,
          reportedUserId: true,
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          comment: {
            select: {
              id: true,
              content: true,
            },
          },
          reporter: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          reportedUser: {
            select: {
              id: true,
              username: true,
              suspended: true,
            },
          },
        },
      }),
      prisma.report.count(),
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

export const reportService = new ReportService();
