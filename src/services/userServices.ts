import { prisma } from "../db/client.js";
import { passwordService } from "../utils/passwordService.js";
import { jwtService } from "../utils/jwtService.js";
import { AppError } from "../errors/appError.js";
import {
  UpdateSettingsType,
  UserLoginType,
  UserSignupType,
  UserUpdateEmailType,
  UserUpdateUsernameType,
} from "../validation/userValidation.js";
import { cloudinaryService } from "../utils/cloudinaryService.js";

class UserService {
  async signup(payload: UserSignupType) {
    const { username, email, password, displayName } = payload;
    const hashedPassword = await passwordService.hashPassword({ password });

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profile: {
          create: {
            displayName,
          },
        },
        settings: {
          create: {},
        },
      },
      select: {
        email: true,
        active: true,
        suspended: true,
        createdAt: true,
        settings: {
          select: {
            theme: true,
            fontSize: true,
            lineHeight: true,
            notifications: true,
          },
        },
        profile: {
          select: {
            id: true,
            avatarUrl: true,
            avatarPath: true,
            displayName: true,
          },
        },
      },
    });
    return user;
  }

  /**
   * Login a user and return user info with JWT
   * @param payload - User credentials
   * @returns User info without password + JWT token
   */
  async login(payload: UserLoginType) {
    const { username, password } = payload;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        password: true, // needed for password comparison
        active: true,
        suspended: true,
        createdAt: true,
        settings: {
          select: {
            theme: true,
            fontSize: true,
            lineHeight: true,
            notifications: true,
          },
        },
        profile: {
          select: {
            avatarUrl: true,
            displayName: true,
            bio: true,
            nationality: true,
            socials: true,
            coverImageUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 403); // will be handled by asyncHandler
    }

    // Check if user is suspended
    if (user.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    // Check if the password matches
    await passwordService.comparePassword({
      password,
      hashedPassword: user.password,
    });

    // Remove password before returning

    // Generate JWT
    const token = jwtService.sign({ id: user.id, role: "USER" });
    const { password: _password, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async updateUserEmail(userId: string, payload: UserUpdateEmailType) {
    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true },
    });

    if (user?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    const emailUser = await prisma.user.findFirst({
      where: { email: payload.email },
    });
    if (emailUser && emailUser.id !== userId) {
      throw new AppError("Email already in use");
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: payload,
      select: {
        email: true,
      },
    });

    return updatedUser;
  }

  async updateUserUsername(userId: string, payload: UserUpdateUsernameType) {
    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true },
    });

    if (user?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    const existingUsernameUser = await prisma.user.findFirst({
      where: { username: payload.username },
    });
    if (existingUsernameUser && existingUsernameUser.id !== userId) {
      throw new AppError("Username already in use", 400);
    }
    await prisma.user.update({
      where: { id: userId },
      data: payload,
      select: {
        email: true,
        username: true,
      },
    });

    return { success: true };
  }
  async updateUserAvatar(userId: string, avatar: string) {
    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true, profile: { select: { avatarPath: true } } },
    });

    if (user?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    const avatarPath = await prisma.profile.findFirst({
      where: { userId },
      select: { avatarPath: true },
    });
    let avatarUpload;
    if (avatarPath?.avatarPath === null) {
      avatarUpload = await cloudinaryService.uploadBase64({
        base64: avatar,
        folder: "avatars",
      });
    } else {
      avatarUpload = await cloudinaryService.uploadBase64({
        base64: avatar,
        folder: "avatars",
        publicId: avatarPath?.avatarPath,
      });
    }

    const updatedAvatar = await prisma.profile.update({
      where: { userId },
      data: { avatarUrl: avatarUpload.url, avatarPath: avatarUpload.path },
      select: { avatarUrl: true },
    });

    return updatedAvatar;
  }

  async updateUserCoverImage(userId: string, coverImage: string) {
    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true },
    });

    if (user?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    const coverImageUpload = await cloudinaryService.uploadBase64({
      base64: coverImage,
      folder: "covers",
    });
    const updatedCoverImage = await prisma.profile.update({
      where: { userId },
      data: {
        coverImageUrl: coverImageUpload.url,
        coverImagePath: coverImageUpload.path,
      },
      select: { coverImageUrl: true },
    });

    return updatedCoverImage;
  }

  async updateUserBio(userId: string, bio: string | null) {
    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true },
    });

    if (user?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    const updatedUser = await prisma.profile.update({
      where: { userId },
      data: { bio },
      select: { bio: true },
    });
    return updatedUser;
  }

  async updateUserNationality(userId: string, nationality: string | null) {
    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true },
    });

    if (user?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    const updatedUser = await prisma.profile.update({
      where: { userId },
      data: { nationality },
      select: { nationality: true },
    });
    return updatedUser;
  }

  async updateDisplayName(userId: string, displayName: string) {
    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true },
    });

    if (user?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { displayName },
      select: { displayName: true },
    });
    return updatedProfile;
  }

  async updateSocials(
    userId: string,
    socials: { media: string; link: string }[],
  ) {
    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true },
    });

    if (user?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { socials },
      select: { socials: true },
    });
    return updatedProfile;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true, suspended: true },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    await passwordService.comparePassword({
      password: currentPassword,
      hashedPassword: user.password,
    });

    const hashedNewPassword = await passwordService.hashPassword({
      password: newPassword,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }

  async changeSettings(userId: string, settings: UpdateSettingsType) {
    // Check if user is suspended
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspended: true },
    });

    if (user?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    const theme = settings.theme;
    const fontSize = settings.fontSize;
    const lineHeight = settings.lineHeight;
    const updatedUser = await prisma.settings.update({
      where: { userId },
      data: { theme, fontSize, lineHeight },
      select: { theme: true, fontSize: true, lineHeight: true },
    });
    return updatedUser;
  }

  async getPublicProfile(currentUserId: string | null, targetUsername: string) {
    const user = await prisma.user.findFirst({
      where: {
        username: targetUsername.toLowerCase(),
      },

      select: {
        id: true,
        username: true,
        createdAt: true,

        blockedUsers: {
          where: currentUserId ? { blockedId: currentUserId } : undefined,
          select: { blockedId: true },
        },

        blockedBy: {
          where: currentUserId ? { blockerId: currentUserId } : undefined,
          select: { blockerId: true },
        },

        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
            coverImageUrl: true,
            bio: true,
            nationality: true,
            socials: true,
          },
        },

        posts: {
          where: {
            published: true,
            isDeleted: false,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            coverImageUrl: true,
            summary: true,
            createdAt: true,
          },
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
        },

        _count: {
          select: {
            subscribers: true,
            subscribing: true,
            posts: {
              where: {
                published: true,
                isDeleted: false,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isBlocked =
      currentUserId &&
      (user.blockedUsers.some((b) => b.blockedId === currentUserId) ||
        user.blockedBy.some((b) => b.blockerId === currentUserId));

    // Subscription check
    let isFollowing = false;

    if (currentUserId && currentUserId !== user.id) {
      const followRecord = await prisma.subscription.findUnique({
        where: {
          subscriberId_subscribedId: {
            subscriberId: currentUserId,
            subscribedId: user.id,
          },
        },
        select: { id: true },
      });

      isFollowing = !!followRecord;
    }

    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,

      profile: user.profile,

      isBlocked: !!isBlocked,
      isFollowing,
      isMe: currentUserId === user.id,

      stats: {
        posts: user._count.posts,
        subscribers: user._count.subscribers,
        subscribing: user._count.subscribing,
      },

      latestPosts: isBlocked ? [] : user.posts,
    };
  }
}

export const userService = new UserService();
