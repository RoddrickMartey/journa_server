import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { blockService } from "../services/blockService";

class BlockController {
  toggleBlock = asyncHandler(async (req: Request, res: Response) => {
    const blockerId = req.auth!.id;
    const { blockedId } = req.params as { blockedId: string };

    await blockService.toggleBlock(blockerId, blockedId);

    res.status(200).json({
      success: true,
      message: "Block status updated",
    });
  });
}

export const blockController = new BlockController();
