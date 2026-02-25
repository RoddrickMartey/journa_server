import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { adminSuspensionService } from "../services/adminSuspensionService";

class AdminSuspensionController {
  suspendUser = asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.auth!.id;
    const { userId } = req.params as { userId: string };

    const result = await adminSuspensionService.suspendUser(userId, adminId);
    return res.status(200).json({
      message: "User suspended successfully",
      ...result,
    });
  });

  unsuspendUser = asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.auth!.id;
    const { userId } = req.params as { userId: string };

    const result = await adminSuspensionService.unsuspendUser(userId, adminId);
    return res.status(200).json({
      message: "User unsuspended successfully",
      ...result,
    });
  });

  suspendPost = asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.auth!.id;
    const { postId } = req.params as { postId: string };

    const result = await adminSuspensionService.suspendPost(postId, adminId);
    return res.status(200).json({
      message: "Post suspended successfully",
      ...result,
    });
  });

  unsuspendPost = asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.auth!.id;
    const { postId } = req.params as { postId: string };

    const result = await adminSuspensionService.unsuspendPost(postId, adminId);
    return res.status(200).json({
      message: "Post unsuspended successfully",
      ...result,
    });
  });

  deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.auth!.id;
    const { commentId } = req.params as { commentId: string };

    const result = await adminSuspensionService.deleteComment(
      commentId,
      adminId,
    );
    return res.status(200).json(result);
  });
}

export const adminSuspensionController = new AdminSuspensionController();
