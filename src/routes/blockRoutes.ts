import { Router } from "express";
import { authUserMiddleware } from "../middlewares/authMiddleware";
import { blockController } from "../controllers/blockController";

const router = Router();

// Toggle block / unblock a user
router.post("/:blockedId", authUserMiddleware, blockController.toggleBlock);

export default router;
