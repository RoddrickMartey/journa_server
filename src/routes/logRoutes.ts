import { Router } from "express";
import { logController } from "../controllers/logController.js";
import { authAdminMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// All log routes require admin authentication
router.use(authAdminMiddleware);

// Get routes
router.get("/", logController.getAllLogs);
router.get("/stats", logController.getLogStats);
router.get("/my-logs", logController.getMyLogs);
router.get("/action/:action", logController.getLogsByAction);
router.get("/admin/:adminId", logController.getLogsByAdminId);
router.get("/:logId", logController.getLogById);

// Update log
router.put("/:logId", logController.updateLog);

export default router;
