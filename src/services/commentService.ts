import { prisma } from "../db/client";
import { AppError } from "../errors/appError";

class CommentService {
  async createComment(content: string, userId: string, postId: string) {
    await prisma.comment.create({
      data: { content, userId, postId },
      include: {
        user: { include: { profile: true } },
      },
    });
  }

  async updateComment(content: string, userId: string, commentId: string) {
    // We check userId to ensure the user owns the comment they are editing
    await prisma.comment.update({
      where: { id: commentId, userId },
      data: { content, isEdited: true },
    });
  }

  async toggleLikeComment(userId: string, commentId: string) {
    // Look for existing like using the unique compound index from your schema
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: { userId, commentId },
      },
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: {
          userId_commentId: { userId, commentId },
        },
      });
    }

    await prisma.commentLike.create({
      data: { userId, commentId },
    });
  }

  async deleteComment(userId: string, commentId: string) {
    // Use soft delete since your schema has an isDeleted flag
    await prisma.comment.delete({
      where: { id: commentId, userId },
    });
  }
}

export const commentService = new CommentService();
