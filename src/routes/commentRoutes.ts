import { Router } from "express";
import { authUserMiddleware } from "../middlewares/authMiddleware";
import { commentController } from "../controllers/commentController";

const router = Router();

// Create comment (on a post)
router.post(
  "/post/:postId",
  authUserMiddleware,
  commentController.createComment,
);

// Update comment
router.patch(
  "/:commentId",
  authUserMiddleware,
  commentController.updateComment,
);

// Toggle like on comment
router.post(
  "/:commentId/like",
  authUserMiddleware,
  commentController.toggleLikeComment,
);

// Delete comment
router.delete(
  "/:commentId",
  authUserMiddleware,
  commentController.deleteComment,
);

export default router;
