import { Router } from "express";
import { adminFetchController } from "../controllers/adminFetchController";
import { authAdminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// All routes require admin authentication
router.use(authAdminMiddleware);

// Minimal user list
router.get("/users", adminFetchController.getUsers);

// Minimal post list
router.get("/posts", adminFetchController.getPosts);

// Minimal reports list
router.get("/reports", adminFetchController.getReports);

export default router;
