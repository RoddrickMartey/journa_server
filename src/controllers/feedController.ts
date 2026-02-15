import { prisma } from "../db/client";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";

class FeedController {
  publicFeed = asyncHandler(async (req: Request, res: Response) => {
    const [featuredPosts, popularCategories] = await Promise.all([
      prisma.post.findMany({
        where: {
          isDeleted: false,
          published: true,
          isFeatured: true,
          publishedAt: { not: null },
        },
        select: {
          title: true,
          coverImageUrl: true,
          slug: true,
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
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          views: true,
          readTime: true,
          _count: { select: { likes: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: 6,
      }),

      prisma.category.findMany({
        orderBy: { posts: { _count: "desc" } },
        select: {
          id: true,
          name: true,
          colorDark: true,
          colorLight: true,
          slug: true,
          _count: {
            select: {
              posts: {
                where: { published: true, isDeleted: false },
              },
            },
          },
        },
        take: 5,
      }),
    ]);

    res.status(200).json({ featuredPosts, popularCategories });
  });
}

export const feedController = new FeedController();
