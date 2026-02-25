import { Router } from "express";
import { userController } from "../controllers/userController";
import { authUserMiddleware } from "../middlewares/authMiddleware";
import {
  authLimiter,
  createUpdateLimiter,
} from "../middlewares/rateLimiter.js";
import { restrictGuest } from "../middlewares/restrictGuest.js";

const router = Router();

// Authentication routes - Very strict rate limiting
router.post("/login", authLimiter, userController.login);
router.post("/signup", authLimiter, userController.signUp);

// Update operations - Strict rate limiting
router.put(
  "/update/email",
  authUserMiddleware,
  createUpdateLimiter,
  restrictGuest,
  userController.userUpdateEmail,
);
router.put(
  "/update/username",
  authUserMiddleware,
  createUpdateLimiter,
  restrictGuest,
  userController.userUpdateUsername,
);

router.put(
  "/update/avatar",
  authUserMiddleware,
  createUpdateLimiter,
  restrictGuest,
  userController.userUpdateAvatar,
);

router.put(
  "/update/cover",
  authUserMiddleware,
  createUpdateLimiter,
  restrictGuest,
  userController.userUpdateCover,
);

router.put(
  "/update/bio",
  authUserMiddleware,
  createUpdateLimiter,
  restrictGuest,
  userController.userUpdateBio,
);

router.put(
  "/update/nationality",
  authUserMiddleware,
  createUpdateLimiter,
  restrictGuest,
  userController.userUpdateNationality,
);

router.put(
  "/update/displayname",
  authUserMiddleware,
  createUpdateLimiter,
  restrictGuest,
  userController.userUpdateDisplayName,
);

router.put(
  "/update/socials",
  authUserMiddleware,
  createUpdateLimiter,
  restrictGuest,
  userController.userUpdateSocials,
);

router.put(
  "/change-password",
  authUserMiddleware,
  createUpdateLimiter,
  restrictGuest,
  userController.userUpdatePassword,
);

router.put(
  "/update/settings",
  authUserMiddleware,
  createUpdateLimiter,
  restrictGuest,
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
