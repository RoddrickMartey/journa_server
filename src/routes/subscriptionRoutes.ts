import { Router } from "express";
import { authUserMiddleware } from "../middlewares/authMiddleware";
import { subscriptionController } from "../controllers/subscriptionController";

const router = Router();

router.post(
  "/:subscribedId",
  authUserMiddleware,
  subscriptionController.toggleSubscription,
);

export default router;
