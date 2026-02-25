import { Router } from "express";
import { reportController } from "../controllers/reportController.js";
import {
  authUserMiddleware,
  authAdminMiddleware,
} from "../middlewares/authMiddleware.js";
import { reportLimiter, readLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Create report (authenticated user) - Strict limit: 20 per day to prevent false reports
router.post(
  "/",
  authUserMiddleware,
  reportLimiter,
  reportController.createReport,
);

// Admin: fetch all reports - Read operation limit
router.get(
  "/",
  authAdminMiddleware,
  readLimiter,
  reportController.getAllReports,
);

export default router;
