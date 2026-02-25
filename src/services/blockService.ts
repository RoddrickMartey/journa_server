import { prisma } from "../db/client.js";
import { AppError } from "../errors/appError.js";

class BlockService {
  async toggleBlock(blockerId: string, blockedId: string) {
    // Check if blocker is suspended
    const blocker = await prisma.user.findUnique({
      where: { id: blockerId },
      select: { suspended: true },
    });

    if (blocker?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    if (blockerId === blockedId) {
      throw new Error("You cannot block yourself.");
    }

    const existing = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId, blockedId } },
    });

    if (existing) {
      await prisma.block.delete({
        where: { blockerId_blockedId: { blockerId, blockedId } },
      });

      return { blocked: false };
    }

    await prisma.block.create({
      data: { blockerId, blockedId },
    });

    return { blocked: true };
  }
}

export const blockService = new BlockService();
