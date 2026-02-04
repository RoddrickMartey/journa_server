import { prisma } from "../db/client";
import { passwordService } from "../utils/passwordService";
import { jwtService } from "../utils/jwtService";
import { AppError } from "../errors/appError";
import {
  UpdateSettingsType,
  UserLoginType,
  UserSignupType,
  UserUpdateEmailType,
  UserUpdateUsernameType,
} from "../validation/userValidation";
import { cloudinaryService } from "../utils/cloudinaryService";

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

    // Check if the password matches
    await passwordService.comparePassword({
      password,
      hashedPassword: user.password,
    });

    // Remove password before returning

    // Generate JWT
    const token = jwtService.sign({ id: user.id, role: "USER" });
    const { password: _password, id: _id, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async updateUserEmail(userId: string, payload: UserUpdateEmailType) {
    const emailUser = await prisma.user.findFirst({
      where: { email: payload.email },
    });
    if (emailUser?.id !== userId) {
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
    const useranmeUser = await prisma.user.findFirst({
      where: { username: payload.username },
    });
    if (useranmeUser?.id !== userId) {
      throw new AppError("Username already in use");
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
    const updatedUser = await prisma.profile.update({
      where: { userId },
      data: { bio },
      select: { bio: true },
    });
    return updatedUser;
  }

  async updateUserNationality(userId: string, nationality: string | null) {
    const updatedUser = await prisma.profile.update({
      where: { userId },
      data: { nationality },
      select: { nationality: true },
    });
    return updatedUser;
  }

  async updateDisplayName(userId: string, displayName: string) {
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
    console.log(socials);

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new AppError("User not found", 404);
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
}

export const userService = new UserService();
