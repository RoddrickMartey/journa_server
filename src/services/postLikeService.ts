import { prisma } from "../db/client";
import { AppError } from "../errors/appError";

class PostLikeService {
  /**
   * Toggles the like.
   */
  async toggleLike(userId: string, postId: string) {
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (existingLike) {
      await prisma.postLike.delete({
        where: {
          userId_postId: { userId, postId },
        },
      });
      return;
    }

    await prisma.postLike.create({
      data: { userId, postId },
    });
  }
}

export const postLikeService = new PostLikeService();
