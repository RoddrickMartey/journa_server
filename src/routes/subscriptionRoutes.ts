import { Router } from "express";
import { authUserMiddleware } from "../middlewares/authMiddleware";
import { subscriptionController } from "../controllers/subscriptionController";
import { likeSubscribeLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Toggle subscription - Generous limit: 100 per 15 min
router.post(
  "/:subscribedId",
  authUserMiddleware,
  likeSubscribeLimiter,
  subscriptionController.toggleSubscription,
);

export default router;
