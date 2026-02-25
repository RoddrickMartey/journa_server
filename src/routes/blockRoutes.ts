import { Router } from "express";
import { authUserMiddleware } from "../middlewares/authMiddleware";
import { blockController } from "../controllers/blockController";
import { blockLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Toggle block / unblock a user - Moderate limit: 100 per hour
router.post(
  "/:blockedId",
  authUserMiddleware,
  blockLimiter,
  blockController.toggleBlock,
);

export default router;
