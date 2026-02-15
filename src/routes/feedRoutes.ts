import { feedController } from "../controllers/feedController";
import { Router } from "express";

const router = Router();

router.get("/public", feedController.publicFeed);

export default router;
