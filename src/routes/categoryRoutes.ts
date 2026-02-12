import { categoryController } from "../controllers/categoryController";
import { Router } from "express";
import { authAdminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", categoryController.getAllCategories);

router.use(authAdminMiddleware);

router.get("/:categoryId", categoryController.getCategoryById);
router.post("/", categoryController.createCategory);
router.put("/:categoryId", categoryController.updateCategory);
router.delete("/:categoryId", categoryController.deleteCategory);
export default router;
