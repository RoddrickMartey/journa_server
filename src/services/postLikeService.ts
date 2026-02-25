import { prisma } from "../db/client";
import { AppError } from "../errors/appError";

class PostLikeService {
  async toggleLike(userId: string, postId: string) {
    // 1️⃣ Validate post visibility + block rules
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        isDeleted: false,
        suspended: false,
        published: true,
        author: {
          suspended: false,
          blockedUsers: {
            none: { blockedId: userId },
          },
          blockedBy: {
            none: { blockerId: userId },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!post) {
      throw new AppError("Post not found or unavailable", 404);
    }

    // 2️⃣ Toggle like
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
      select: { id: true },
    });

    if (existingLike) {
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });

      return { liked: false };
    }

    await prisma.postLike.create({
      data: { userId, postId },
    });

    return { liked: true };
  }
}

export const postLikeService = new PostLikeService();
