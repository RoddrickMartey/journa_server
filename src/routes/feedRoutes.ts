import { feedController } from "../controllers/feedController.js";
import { Router } from "express";
import { authUserMiddleware } from "../middlewares/authMiddleware.js";
import { feedLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Public feed - Moderate limit to prevent scraping: 100 per 5 min
router.get("/public", feedLimiter, feedController.publicFeed);

// Private feed - Moderate limit: 100 per 5 min
router.get(
  "/private",
  authUserMiddleware,
  feedLimiter,
  feedController.privateFeed,
);

// Explore feed - Moderate limit: 100 per 5 min
router.get("/explore", authUserMiddleware, feedLimiter, feedController.explore);

export default router;
