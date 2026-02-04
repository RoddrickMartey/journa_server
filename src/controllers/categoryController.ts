import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { categoryService } from "../services/categoryService";
import { categorySchema } from "../validation/categoryValidation";

class CategoryController {
  getAllCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json(categories);
  });

  getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params as { categoryId: string };
    const category = await categoryService.getCategoryById(categoryId);
    return res.status(200).json(category);
  });

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const payload = categorySchema.parse(req.body);
    const newCategory = await categoryService.createCategory(payload);
    return res.status(201).json(newCategory);
  });

  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params as { categoryId: string };
    const payload = categorySchema.parse(req.body);
    const updatedCategory = await categoryService.updateCategory(
      categoryId,
      payload,
    );
    return res.status(200).json(updatedCategory);
  });

  deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId } = req.params as { categoryId: string };
    await categoryService.deleteCategory(categoryId);
    return res.status(204).json({ message: "Category deleted successfully" });
  });
}

export const categoryController = new CategoryController();
