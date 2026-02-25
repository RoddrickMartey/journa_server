import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { authAdminMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Public routes
router.post("/login", adminController.loginAdmin);
router.post("/create", adminController.createAdmin);

// Protected routes (authenticated admin required)
router.get("/profile", authAdminMiddleware, adminController.getProfile);
router.get("/:adminId", authAdminMiddleware, adminController.getAdminById);
router.get("/", authAdminMiddleware, adminController.getAllAdmins);

// Update routes (piece by piece)
router.put("/update/email", authAdminMiddleware, adminController.updateEmail);
router.put(
  "/update/username",
  authAdminMiddleware,
  adminController.updateUsername,
);
router.put("/update/name", authAdminMiddleware, adminController.updateName);
router.put("/update/number", authAdminMiddleware, adminController.updateNumber);
router.put("/update/avatar", authAdminMiddleware, adminController.updateAvatar);

// Update multiple fields at once
router.put(
  "/update/profile",
  authAdminMiddleware,
  adminController.updateProfile,
);

// Password route
router.put(
  "/change-password",
  authAdminMiddleware,
  adminController.changePassword,
);

export default router;
