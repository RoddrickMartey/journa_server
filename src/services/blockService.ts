import { prisma } from "../db/client";
class BlockService {
  async toggleBlock(blockerId: string, blockedId: string) {
    const existing = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId, blockedId } },
    });

    if (existing) {
      await prisma.block.delete({
        where: { blockerId_blockedId: { blockerId, blockedId } },
      });
    }

    await prisma.block.create({
      data: { blockerId, blockedId },
    });
  }
}

export const blockService = new BlockService();
