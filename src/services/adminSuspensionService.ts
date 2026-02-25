import { prisma } from "../db/client.js";
import { AppError } from "../errors/appError.js";

class AdminSuspensionService {
  /**
   * Suspend a user
   */
  async suspendUser(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true, id: true, username: true },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.suspended) {
      throw new AppError("User is already suspended", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { suspended: true },
      select: {
        id: true,
        username: true,
        email: true,
        suspended: true,
        createdAt: true,
      },
    });

    // Log the action
    await prisma.log.create({
      data: {
        actorId: adminId,
        action: "SUSPEND_USER",
        meta: { userId, username: user.username },
        description: `Suspended user ${user.username}`,
      },
    });

    return updatedUser;
  }

  /**
   * Unsuspend/Activate a user
   */
  async unsuspendUser(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true, id: true, username: true },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.suspended) {
      throw new AppError("User is not suspended", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { suspended: false },
      select: {
        id: true,
        username: true,
        email: true,
        suspended: true,
        createdAt: true,
      },
    });

    // Log the action
    await prisma.log.create({
      data: {
        actorId: adminId,
        action: "ACTIVATE_USER",
        meta: { userId, username: user.username },
        description: `Activated user ${user.username}`,
      },
    });

    return updatedUser;
  }

  /**
   * Suspend a post
   */
  // Suspend a post
  async suspendPost(postId: string, adminId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        suspended: true,
        author: { select: { username: true } },
      },
    });

    if (!post) throw new AppError("Post not found", 404);
    if (post.suspended) throw new AppError("Post is already suspended", 400);

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      // When suspending, we usually hide it from public (published: false)
      data: { suspended: true, published: false },
    });

    await prisma.log.create({
      data: {
        actorId: adminId,
        action: "DELETE_POST", // Or keep your enum mapping
        meta: { postId, title: post.title, author: post.author.username },
        description: `Suspended post "${post.title}" by ${post.author.username}`,
      },
    });

    return updatedPost;
  }

  // Unsuspend a post
  async unsuspendPost(postId: string, adminId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        suspended: true,
        author: { select: { username: true } },
      },
    });

    if (!post) throw new AppError("Post not found", 404);
    if (!post.suspended) throw new AppError("Post is not suspended", 400);

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { suspended: false },
    });

    await prisma.log.create({
      data: {
        actorId: adminId,
        action: "RESTORE_POST",
        meta: { postId, title: post.title, author: post.author.username },
        description: `Unsuspended post "${post.title}" by ${post.author.username}`,
      },
    });

    return updatedPost;
  }

  /**
   * Permanently delete a comment
   */
  async deleteComment(commentId: string, adminId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        content: true,
        user: { select: { username: true } },
      },
    });

    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    // Log the action
    await prisma.log.create({
      data: {
        actorId: adminId,
        action: "OTHER",
        meta: { commentId, author: comment.user.username },
        description: `Permanently deleted comment by ${comment.user.username}`,
      },
    });

    return { success: true, message: "Comment permanently deleted" };
  }
}

export const adminSuspensionService = new AdminSuspensionService();
