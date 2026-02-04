import { prisma } from "../db/client";
import { AppError } from "../errors/appError";
import { slugGenerator } from "../utils/slugGenerater";
import { CreatePost } from "../validation/postValidation";

class PostService {
  async CreatePast(payload: CreatePost, userId: string) {
    const slug = slugGenerator.generateSlugForTitle(payload.title);
    await prisma.post.create({
      data: { ...payload, slug, userId, content: [] },
    });
    return { success: true };
  }

  async getPostForEditing(slug: string, userId: string) {
    const post = await prisma.post.findFirst({
      where: { slug, userId, isDeleted: false },
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
          },
        },
      },
    });
    if (post === null) {
      throw new AppError(`Post ${slug} doesn't exist`, 400);
    }
    return post;
  }

  async getPost(slug: string) {
    const post = await prisma.post.findFirst({
      where: { slug, isDeleted: false },
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
  }
}
