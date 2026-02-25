import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { postLikeService } from "../services/postLikeService.js";

class PostLikeController {
  toggleLike = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const { postId } = req.params as { postId: string };

    await postLikeService.toggleLike(userId, postId);

    res.status(200).json({
      success: true,
      message: "Post like toggled",
    });
  });
}

export const postLikeController = new PostLikeController();
