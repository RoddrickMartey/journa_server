import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { commentService } from "../services/commentService.js";
import { commentSchema } from "../validation/commentValidation.js";

class CommentController {
  createComment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const { postId } = req.params as { postId: string };
    const { content } = commentSchema.parse(req.body);
    await commentService.createComment(content, userId, postId);
    res.status(201).json({ success: true });
  });
  updateComment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const { commentId } = req.params as { commentId: string };
    const { content } = commentSchema.parse(req.body);
    await commentService.updateComment(content, userId, commentId);
    res.status(201).json({ success: true });
  });

  toggleLikeComment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const { commentId } = req.params as { commentId: string };
    await commentService.toggleLikeComment(userId, commentId);
    res.status(201).json({ success: true });
  });

  deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    console.log("456");
    const { commentId } = req.params as { commentId: string };
    console.log(commentId);

    await commentService.deleteComment(userId, commentId);

    return res.status(201).json({ success: true });
  });
}

export const commentController = new CommentController();
