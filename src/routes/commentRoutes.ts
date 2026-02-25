import { Router } from "express";
import { authUserMiddleware } from "../middlewares/authMiddleware";
import { commentController } from "../controllers/commentController";
import {
  commentCreationLimiter,
  createUpdateLimiter,
  likeSubscribeLimiter,
} from "../middlewares/rateLimiter.js";

const router = Router();

// Create comment (on a post) - Moderate limit: 50 per hour
router.post(
  "/post/:postId",
  authUserMiddleware,
  commentCreationLimiter,
  commentController.createComment,
);

// Update comment - Moderate limit
router.patch(
  "/:commentId",
  authUserMiddleware,
  createUpdateLimiter,
  commentController.updateComment,
);

// Toggle like on comment - Generous limit: 100 per 15 min
router.post(
  "/:commentId/like",
  authUserMiddleware,
  likeSubscribeLimiter,
  commentController.toggleLikeComment,
);

// Delete comment - Moderate limit
router.delete(
  "/:commentId",
  authUserMiddleware,
  createUpdateLimiter,
  commentController.deleteComment,
);

export default router;
