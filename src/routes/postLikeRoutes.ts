import { Router } from "express";
import { authUserMiddleware } from "../middlewares/authMiddleware";
import { postLikeController } from "../controllers/postLikeController";

const router = Router();

router.post("/:postId", authUserMiddleware, postLikeController.toggleLike);

export default router;
