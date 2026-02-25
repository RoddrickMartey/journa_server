import { Router } from "express";
import { authUserMiddleware } from "../middlewares/authMiddleware.js";
import { postLikeController } from "../controllers/postLikeController.js";
import { likeSubscribeLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Toggle like - Generous limit: 100 per 15 min
router.post(
  "/:postId",
  authUserMiddleware,
  likeSubscribeLimiter,
  postLikeController.toggleLike,
);

export default router;
