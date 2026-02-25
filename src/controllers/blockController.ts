import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { blockService } from "../services/blockService.js";

class BlockController {
  toggleBlock = asyncHandler(async (req: Request, res: Response) => {
    const blockerId = req.auth!.id;
    const { blockedId } = req.params as { blockedId: string };

    const result = await blockService.toggleBlock(blockerId, blockedId);

    res.status(200).json({
      success: true,
      blocked: result.blocked,
    });
  });
}

export const blockController = new BlockController();
