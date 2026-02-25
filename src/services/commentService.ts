import { prisma } from "../db/client.js";
import { AppError } from "../errors/appError.js";

class CommentService {
  async createComment(content: string, userId: string, postId: string) {
    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true },
    });

    if (user?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    // Check if post is suspended
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { suspended: true },
    });

    if (post?.suspended) {
      throw new AppError("Cannot comment on a suspended post", 403);
    }

    await prisma.comment.create({
      data: { content, userId, postId },
      include: {
        user: { include: { profile: true } },
      },
    });
  }

  async updateComment(content: string, userId: string, commentId: string) {
    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true },
    });

    if (user?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    // We check userId to ensure the user owns the comment they are editing
    await prisma.comment.update({
      where: { id: commentId, userId },
      data: { content, isEdited: true },
    });
  }

  async toggleLikeComment(userId: string, commentId: string) {
    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true },
    });

    if (user?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    // 1️⃣ Validate comment visibility + block rules
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        isDeleted: false,

        user: {
          suspended: false,

          // Comment author has NOT blocked viewer
          blockedUsers: {
            none: { blockedId: userId },
          },

          // Viewer has NOT blocked comment author
          blockedBy: {
            none: { blockerId: userId },
          },
        },

        post: {
          isDeleted: false,
          published: true,

          author: {
            suspended: false,

            // Post author has NOT blocked viewer
            blockedUsers: {
              none: { blockedId: userId },
            },

            // Viewer has NOT blocked post author
            blockedBy: {
              none: { blockerId: userId },
            },
          },
        },
      },
      select: { id: true },
    });

    if (!comment) {
      throw new AppError("Comment not found or unavailable", 404);
    }

    // 2️⃣ Toggle like
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: { userId, commentId },
      },
      select: { id: true },
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });

      return { liked: false };
    }

    await prisma.commentLike.create({
      data: { userId, commentId },
    });

    return { liked: true };
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== userId) throw new Error("Unauthorized");

    // Soft delete
    await prisma.comment.delete({
      where: { id: commentId },
    });
  }
}

export const commentService = new CommentService();
