import { Router } from "express";
import { userController } from "../controllers/userController";
import { authUserMiddleware } from "../middlewares/authMiddleware";
import {
  authLimiter,
  createUpdateLimiter,
} from "../middlewares/rateLimiter.js";

const router = Router();

// Authentication routes - Very strict rate limiting
router.post("/login", authLimiter, userController.login);
router.post("/signup", authLimiter, userController.signUp);

// Update operations - Strict rate limiting
router.put(
  "/update/email",
  authUserMiddleware,
  createUpdateLimiter,
  userController.userUpdateEmail,
);
router.put(
  "/update/username",
  authUserMiddleware,
  createUpdateLimiter,
  userController.userUpdateUsername,
);

router.put(
  "/update/avatar",
  authUserMiddleware,
  createUpdateLimiter,
  userController.userUpdateAvatar,
);

router.put(
  "/update/cover",
  authUserMiddleware,
  createUpdateLimiter,
  userController.userUpdateCover,
);

router.put(
  "/update/bio",
  authUserMiddleware,
  createUpdateLimiter,
  userController.userUpdateBio,
);

router.put(
  "/update/nationality",
  authUserMiddleware,
  createUpdateLimiter,
  userController.userUpdateNationality,
);

router.put(
  "/update/displayname",
  authUserMiddleware,
  createUpdateLimiter,
  userController.userUpdateDisplayName,
);

router.put(
  "/update/socials",
  authUserMiddleware,
  createUpdateLimiter,
  userController.userUpdateSocials,
);

router.put(
  "/change-password",
  authUserMiddleware,
  createUpdateLimiter,
  userController.userUpdatePassword,
);

router.put(
  "/update/settings",
  authUserMiddleware,
  createUpdateLimiter,
  userController.userUpdateSettings,
);

// Logout route - Rate limited with auth
router.post("/logout", authUserMiddleware, authLimiter, userController.logout);

// Note that the web app requires users to be logged in before they can read data
router.get(
  "/public-profile/:username",
  authUserMiddleware,
  userController.getUserPublicProfile,
);

export default router;
