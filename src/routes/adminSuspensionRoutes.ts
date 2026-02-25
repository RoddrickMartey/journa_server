import { Router } from "express";
import { adminSuspensionController } from "../controllers/adminSuspensionController.js";
import { authAdminMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// All routes require admin authentication
router.use(authAdminMiddleware);

// User suspension
router.post("/users/:userId/suspend", adminSuspensionController.suspendUser);
router.post(
  "/users/:userId/unsuspend",
  adminSuspensionController.unsuspendUser,
);

// Post suspension
router.post("/posts/:postId/suspend", adminSuspensionController.suspendPost);
router.post(
  "/posts/:postId/unsuspend",
  adminSuspensionController.unsuspendPost,
);

// Comment permanent deletion
router.delete("/comments/:commentId", adminSuspensionController.deleteComment);

export default router;
