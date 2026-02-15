import { Router } from "express";
import { userController } from "../controllers/userController";
import { authUserMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/login", userController.login);
router.post("/signup", userController.signUp);

router.put("/update/email", authUserMiddleware, userController.userUpdateEmail);
router.put(
  "/update/username",
  authUserMiddleware,
  userController.userUpdateUsername,
);

router.put(
  "/update/avatar",
  authUserMiddleware,
  userController.userUpdateAvatar,
);

router.put("/update/cover", authUserMiddleware, userController.userUpdateCover);

router.put("/update/bio", authUserMiddleware, userController.userUpdateBio);

router.put(
  "/update/nationality",
  authUserMiddleware,
  userController.userUpdateNationality,
);

router.put(
  "/update/displayname",
  authUserMiddleware,
  userController.userUpdateDisplayName,
);

router.put(
  "/update/socials",
  authUserMiddleware,
  userController.userUpdateSocials,
);

router.put(
  "/change-password",
  authUserMiddleware,
  userController.userUpdatePassword,
);

router.put(
  "/update/settings",
  authUserMiddleware,
  userController.userUpdateSettings,
);
router.post("/logout", userController.logout);
export default router;
