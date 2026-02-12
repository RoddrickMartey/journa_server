import { prisma } from "../db/client";
import { AppError } from "../errors/appError";
import { Prisma } from "../generated/prisma/client";
import { calculateReadTime } from "../utils/calculateReadTime";
import { cloudinaryService } from "../utils/cloudinaryService";
import { slugGenerator } from "../utils/slugGenerater";
import { CreatePost, EditorContentType } from "../validation/postValidation";

class PostService {
  async createPast(payload: CreatePost, userId: string) {
    let image;
    if (payload.coverImageBase64) {
      image = await cloudinaryService.uploadBase64({
        base64: payload.coverImageBase64,
        folder: "posts",
      });
    }
    const slug = slugGenerator.generateSlugForTitle(payload.title);
    const id = await prisma.post.create({
      data: {
        title: payload.title,
        slug,
        userId,
        coverImageUrl: image?.url,
        coverImagePath: image?.path,
        categoryId: payload.categoryId,
        tags: payload.tags,
        summary: payload.summary,
      },
      select: {
        id: true,
      },
    });
    return id;
  }
  async updatePost(
    postId: string,
    payload: Partial<CreatePost>,
    userId: string,
  ) {
    // 1. Fetch current data for cleanup and security
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, coverImagePath: true, title: true },
    });

    if (!existingPost) throw new AppError("Post not found", 404);
    if (existingPost.userId !== userId) throw new AppError("Unauthorized", 403);

    let imageUpdate = {};

    // 2. Only handle Cloudinary if a new image is actually sent
    if (payload.coverImageBase64) {
      // Delete the old one first
      if (existingPost.coverImagePath) {
        await cloudinaryService.delete(existingPost.coverImagePath);
      }

      // Upload the new one
      const upload = await cloudinaryService.uploadBase64({
        base64: payload.coverImageBase64,
        folder: "posts",
      });

      imageUpdate = {
        coverImageUrl: upload.url,
        coverImagePath: upload.path,
      };
    }

    // 3. Prepare updated data
    const data: any = {
      ...imageUpdate,
      ...(payload.categoryId && { categoryId: payload.categoryId }),
      ...(payload.tags && { tags: payload.tags }),
      ...(payload.summary !== undefined && { summary: payload.summary }),
    };

    // Only update title and slug if the title is different
    if (payload.title && payload.title !== existingPost.title) {
      data.title = payload.title;
      data.slug = slugGenerator.generateSlugForTitle(payload.title);
    }

    return await prisma.post.update({
      where: { id: postId },
      data,
      select: { id: true, slug: true },
    });
  }

  async removePostCoverImage(postId: string, userId: string) {
    // 1. Fetch to find the image path and verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, coverImagePath: true },
    });

    if (!post) throw new AppError("Post not found", 404);
    if (post.userId !== userId) throw new AppError("Unauthorized", 403);

    // If there's no image anyway, just return
    if (!post.coverImagePath) {
      return { message: "No image to remove" };
    }

    // 2. Delete from Cloudinary
    await cloudinaryService.delete(post.coverImagePath);

    // 3. Nullify the fields in the Database
    await prisma.post.update({
      where: { id: postId },
      data: {
        coverImageUrl: null,
        coverImagePath: null,
      },
    });

    return { message: "Image removed successfully" };
  }

  async getPostForEditing(id: string, userId: string) {
    const post = await prisma.post.findFirst({
      where: { id, userId, isDeleted: false },
      select: {
        title: true,
        content: true,
        summary: true,
        slug: true,
        tags: true,
        coverImageUrl: true,
        coverImagePath: true,
        published: true,
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
    if (post === null) {
      throw new AppError(`Post not Found`, 400);
    }
    return post;
  }

  async getPost(slug: string) {
    const post = await prisma.post.findFirst({
      where: {
        slug,
        isDeleted: false,
        published: true,
        content: { not: Prisma.JsonNull },
      },
      select: {
        title: true,
        content: true,
        summary: true,
        slug: true,
        tags: true,
        coverImageUrl: true,
        publishedAt: true,
        isFeatured: true,
        views: true,
        readTime: true,
        category: {
          select: {
            id: true,
            name: true,
            colorDark: true,
            colorLight: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            profile: {
              select: {
                avatarUrl: true,
                displayName: true,
              },
            },
          },
        },
        comments: {
          where: { isDeleted: false },
          select: {
            id: true,
            content: true,
            isEdited: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                suspended: true,
                profile: {
                  select: {
                    avatarUrl: true,
                    displayName: true,
                  },
                },
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
    if (!post) {
      throw new AppError("Post not found", 403);
    }
    return post;
  }
  async getPostForAuthorView(slug: string, userId: string) {
    const post = await prisma.post.findFirst({
      where: {
        slug,
        isDeleted: false,
        userId,
        content: { not: Prisma.JsonNull },
      },
      select: {
        title: true,
        content: true,
        summary: true,
        slug: true,
        tags: true,
        coverImageUrl: true,
        publishedAt: true,
        isFeatured: true,
        views: true,
        readTime: true,
        category: {
          select: {
            id: true,
            name: true,
            colorDark: true,
            colorLight: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            profile: {
              select: {
                avatarUrl: true,
                displayName: true,
              },
            },
          },
        },
        comments: {
          where: { isDeleted: false },
          select: {
            id: true,
            content: true,
            isEdited: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                suspended: true,
                profile: {
                  select: {
                    avatarUrl: true,
                    displayName: true,
                  },
                },
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
    if (!post) {
      throw new AppError("Post not found", 403);
    }
    return post;
  }

  async getUserPosts(userId: string) {
    const posts = await prisma.post.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        title: true,
        summary: true,
        slug: true,
        tags: true,
        coverImageUrl: true,
        views: true,
        readTime: true,
        published: true,
        updatedAt: true,
        isDeleted: true,
        category: {
          select: {
            id: true,
            name: true,
            colorDark: true,
            colorLight: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
    return posts;
  }

  async uploadPostImage(imageString: string) {
    const image = await cloudinaryService.uploadBase64({
      base64: imageString,
      folder: "posts",
    });
    return image;
  }
  async updateContent(
    content: EditorContentType,
    postId: string,
    userId: string,
  ) {
    // 1. Verify ownership
    const post = await prisma.post.findFirst({
      where: { id: postId, userId },
    });

    if (!post) {
      throw new AppError("Post not found", 400);
    }

    // 2. Calculate the new read time
    const readTimeMinutes = calculateReadTime(content);

    // 3. Update the database
    await prisma.post.update({
      where: { id: postId },
      data: {
        content: content,
        readTime: readTimeMinutes,
      },
    });

    return {
      success: "Post saved",
    };
  }

  async togglePostPublishment(postId: string, userId: string) {
    const post = await prisma.post.findFirst({
      where: { id: postId, userId },
      select: { published: true, isDeleted: true },
    });

    if (!post) {
      throw new AppError("Post not found or unauthorized", 404);
    }

    if (post.isDeleted) {
      throw new AppError("Trashed Posts cannot be published", 403);
    }

    await prisma.post.update({
      where: { id: postId },
      data: { published: !post.published },
    });
  }
  // post.service.ts

  async toggleTrashStatus(postId: string, userId: string) {
    const post = await prisma.post.findFirst({
      where: { id: postId, userId },
      select: { isDeleted: true },
    });

    if (!post) {
      throw new AppError("Post not found or unauthorized", 404);
    }

    const newTrashStatus = !post.isDeleted;

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        isDeleted: newTrashStatus,
        published: false, // Security: always unpublish when moving to OR from trash
      },
    });

    return updatedPost;
  }

  async permanentDelete(postId: string, userId: string) {
    // 1. Verify existence, ownership, and that it is actually IN the trash
    const post = await prisma.post.findFirst({
      where: { id: postId, userId },
      select: { isDeleted: true },
    });

    if (!post) {
      throw new AppError("Post not found or unauthorized", 404);
    }

    // Prevent hard-deleting a post that isn't in the trash yet
    if (!post.isDeleted) {
      throw new AppError("Move post to trash before deleting permanently", 400);
    }

    return await prisma.post.delete({
      where: { id: postId },
    });
  }
}

export const postService = new PostService();
