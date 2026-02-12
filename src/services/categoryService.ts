import { prisma } from "../db/client";
import { CategoryInput } from "../validation/categoryValidation";
import { slugGenerator } from "../utils/slugGenerater";

class CategoryService {
  async getAllCategories() {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        colorDark: true,
        colorLight: true,
        description: true,
      },
    });

    return categories;
  }

  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    return category;
  }

  async createCategory(data: CategoryInput) {
    const slug = slugGenerator.generateSlugForCategory(data.name);
    const newCategory = await prisma.category.create({
      data: {
        ...data,
        slug,
      },
    });
    return newCategory;
  }

  async updateCategory(id: string, data: CategoryInput) {
    const slug = slugGenerator.generateSlugForCategory(data.name);
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
    });
    return updatedCategory;
  }
  async deleteCategory(id: string) {
    await prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryService = new CategoryService();
