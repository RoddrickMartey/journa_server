import { prisma } from "../db/client";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../errors/appError";
import { Request, Response } from "express";

const postSelection = {
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
  author: {
    select: {
      id: true,
      username: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  },
  _count: { select: { likes: true, comments: true } },
  likes: { select: { userId: true } },
};

class FeedController {
  publicFeed = asyncHandler(async (req: Request, res: Response) => {
    const [featuredPosts, popularCategories] = await Promise.all([
      prisma.post.findMany({
        where: {
          isDeleted: false,
          published: true,
          isFeatured: true,
          suspended: false,
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

  privateFeed = asyncHandler(async (req: Request, res: Response) => {
    const currentUserId = req.auth!.id;

    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { suspended: true },
    });

    if (user?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    // --- Optimization: Run all queries in parallel ---
    const [subscribedRaw, featuredRaw, popularRaw, popularUsersRaw] =
      await Promise.all([
        // 1. Subscribed Posts
        prisma.post.findMany({
          where: {
            published: true,
            isDeleted: false,
            suspended: false,
            author: { subscribers: { some: { subscriberId: currentUserId } } },
          },
          orderBy: { publishedAt: "desc" },
          take: 10,
          select: postSelection, // See helper below for DRY code
        }),

        // 2. Featured Posts
        prisma.post.findMany({
          where: {
            published: true,
            isDeleted: false,
            isFeatured: true,
            suspended: false,
          },
          orderBy: { publishedAt: "desc" },
          take: 5,
          select: {
            ...postSelection,
            author: {
              select: {
                ...postSelection.author.select,
                subscribers: {
                  where: { subscriberId: currentUserId },
                  select: { id: true },
                },
              },
            },
          },
        }),

        // 3. Popular Posts (excluding subscribed)
        prisma.post.findMany({
          where: {
            published: true,
            isDeleted: false,
            suspended: false,
            author: { subscribers: { none: { subscriberId: currentUserId } } },
          },
          take: 10,
          orderBy: [
            { views: "desc" },
            { likes: { _count: "desc" } },
            { comments: { _count: "desc" } },
          ],
          select: postSelection,
        }),

        // 4. Popular Users
        prisma.user.findMany({
          where: { active: true, suspended: false },
          take: 10,
          include: {
            profile: { select: { displayName: true, avatarUrl: true } },
            posts: { select: { id: true, likes: true, comments: true } },
          },
        }),
      ]);

    // --- Processing with Destructuring (Fixes the 'delete' error) ---

    const subscribedPosts = subscribedRaw.map(({ likes, ...post }) => ({
      ...post,
      isLiked: likes.some((l) => l.userId === currentUserId),
      isSubscribedAuthor: true,
      source: "subscribed",
    }));

    const featuredPosts = featuredRaw.map(({ likes, ...post }) => ({
      ...post,
      isLiked: likes.some((l) => l.userId === currentUserId),
      isSubscribedAuthor: post.author.subscribers.length > 0,
      source: "featured",
    }));

    const popularPosts = popularRaw.map(({ likes, ...post }) => ({
      ...post,
      isLiked: likes.some((l) => l.userId === currentUserId),
      isSubscribedAuthor: false,
      source: "popular",
    }));

    const popularUsers = popularUsersRaw
      .map((user) => {
        const postsCount = user.posts.length;
        const likesReceived = user.posts.reduce(
          (acc, p) => acc + p.likes.length,
          0,
        );
        const commentsReceived = user.posts.reduce(
          (acc, p) => acc + p.comments.length,
          0,
        );
        return {
          id: user.id,
          username: user.username,
          displayName: user.profile?.displayName,
          avatarUrl: user.profile?.avatarUrl,
          postsCount,
          score: postsCount + likesReceived * 2 + commentsReceived,
        };
      })
      .sort((a, b) => b.score - a.score);

    res.json({
      feed: [...subscribedPosts, ...featuredPosts, ...popularPosts],
      popularUsers,
    });
  });

  explore = asyncHandler(async (req: Request, res: Response) => {
    const { q, sort } = req.query;
    const query = q ? String(q) : "";

    // If there's no query, we could return empty arrays or trending content
    if (!query.trim()) {
      return res.status(200).json({ posts: [], users: [] });
    }

    // Define Post Sorting Logic
    let postOrderBy: any = { createdAt: "desc" }; // Default: Latest

    if (sort === "popular") {
      postOrderBy = { views: "desc" };
    } else if (sort === "trending") {
      postOrderBy = { likes: { _count: "desc" } };
    }

    const [posts, users] = await Promise.all([
      // Search Posts with Dynamic Sorting
      prisma.post.findMany({
        where: {
          isDeleted: false,
          published: true,
          suspended: false,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { tags: { hasSome: [query] } },
            { category: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        select: postSelection,
        orderBy: postOrderBy, // Applied dynamic sorting here
        take: 20,
      }),

      // Search Users
      prisma.user.findMany({
        where: {
          active: true,
          suspended: false,
          OR: [
            { username: { contains: query, mode: "insensitive" } },
            {
              profile: {
                displayName: { contains: query, mode: "insensitive" },
              },
            },
          ],
        },
        select: {
          id: true,
          username: true,
          profile: {
            select: {
              displayName: true,
              avatarUrl: true,
              bio: true,
            },
          },
          _count: {
            select: { posts: { where: { published: true, isDeleted: false } } },
          },
        },
        orderBy: {
          posts: {
            _count: "desc", // Default users to most active/popular creators
          },
        },
        take: 10,
      }),
    ]);

    res.status(200).json({ posts, users });
  });

  // Helper to keep the select block DRY (Clean Code)
}

export const feedController = new FeedController();
