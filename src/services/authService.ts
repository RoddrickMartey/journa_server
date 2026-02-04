import { prisma } from "../db/client";
import { passwordService } from "../utils/passwordService";
import { jwtService } from "../utils/jwtService";
import { AppError } from "../errors/appError";
import {
  AdminLoginType,
  AdminCreateType,
  AdminUpdateEmailType,
  AdminUpdateUsernameType,
  AdminUpdateNameType,
  AdminUpdateNumberType,
  AdminUpdateAvatarType,
  AdminUpdateProfileType,
  AdminChangePasswordType,
} from "../validation/adminValidation";
import { cloudinaryService } from "../utils/cloudinaryService";

class AuthService {
  /**
   * Create a new admin
   * @param payload - Admin creation data
   * @param actorId - ID of the admin creating this admin (optional, for logging)
   * @returns Created admin with JWT
   */
  async createAdmin(payload: AdminCreateType, actorId?: string) {
    const { username, email, password, name, number, avatar, isSuperAdmin } =
      payload;

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingAdmin) {
      throw new AppError(
        "Admin with this email or username already exists",
        409,
      );
    }

    const avatarUpload = await cloudinaryService.uploadBase64({
      base64: avatar,
      folder: "avatars",
    });

    const hashedPassword = await passwordService.hashPassword({ password });
    const date = new Date(Date.now());
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const day = date.getDate();
    const formattedDate = `${year}${month.toString().padStart(2, "0")}${day
      .toString()
      .padStart(2, "0")}`;
    const randomFourNumber = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit random number
    const newAdminId = `ADM-${formattedDate}-${randomFourNumber}`;

    // Use Promise.all to create admin and log together
    const [admin] = await Promise.all([
      prisma.admin.create({
        data: {
          adminId: newAdminId,
          username,
          email,
          password: hashedPassword,
          name,
          number: number || "",
          avatarUrl: avatarUpload.url,
          avatarPath: avatarUpload.path,
          isSuperAdmin: isSuperAdmin || false,
        },
        select: {
          id: true,
          adminId: true,
          email: true,
          username: true,
          name: true,
          number: true,
          avatarUrl: true,
          avatarPath: true,
          createdAt: true,
        },
      }),
      // Create log if actorId is provided
      actorId
        ? prisma.log.create({
            data: {
              actorId,
              action: "OTHER",
              description: `${newAdminId} was created on ${new Date().toISOString()}`,
              meta: {
                newAdminId,
                newAdminEmail: email,
                newAdminUsername: username,
              },
            },
          })
        : Promise.resolve(null),
    ]);

    const token = jwtService.sign({
      id: admin.id,
      role: "ADMIN",
    });

    return {
      admin,
      token,
    };
  }

  /**
   * Login an admin
   * @param payload - Admin credentials
   * @returns Admin info with JWT
   */
  async loginAdmin(payload: AdminLoginType) {
    const { username, password } = payload;

    const admin = await prisma.admin.findUnique({
      where: { username },
      select: {
        id: true,
        adminId: true,
        email: true,
        username: true,
        password: true,
        name: true,
        number: true,
        avatarUrl: true,
        avatarPath: true,
        isSuperAdmin: true,
        isDeleted: true,
      },
    });

    if (!admin) {
      throw new AppError("Invalid username or password", 403);
    }

    if (admin.isDeleted) {
      throw new AppError("This admin account has been deleted", 403);
    }

    const isValidPassword = await passwordService.comparePassword({
      password,
      hashedPassword: admin.password,
    });

    if (!isValidPassword) {
      throw new AppError("Invalid username or password", 403);
    }

    const token = jwtService.sign(
      {
        id: admin.id,
        role: "ADMIN",
      },
      true,
    );

    const {
      password: _,
      isDeleted,
      isSuperAdmin,
      ...adminWithoutPassword
    } = admin;

    await prisma.log.create({
      data: {
        actorId: admin.id, // ✅ must match references: [id]
        action: "OTHER",
        description: `${admin.adminId} logged in on ${new Date().toISOString()}`,
        meta: {
          adminId: admin.adminId,
          action: "Login",
        },
      },
    });

    return {
      admin: adminWithoutPassword,
      token,
      isSuperAdmin,
    };
  }

  /**
   * Update admin email (piece by piece)
   * @param adminId - Admin ID
   * @param payload - Email update data
   * @returns Updated admin
   */
  async updateAdminEmail(adminId: string, payload: AdminUpdateEmailType) {
    const { email } = payload;

    // Check if email is already in use
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin && existingAdmin.id !== adminId) {
      throw new AppError("Email already in use", 409);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { adminId: true, email: true },
    });

    const [updatedAdmin] = await Promise.all([
      prisma.admin.update({
        where: { id: adminId },
        data: { email },
        select: {
          id: true,
          adminId: true,
          email: true,
          username: true,
          name: true,
          number: true,
          avatarUrl: true,
          isSuperAdmin: true,
        },
      }),
      prisma.log.create({
        data: {
          actorId: adminId,
          action: "UPDATE_PROFILE",
          description: `${admin?.adminId} updated email from ${admin?.email} to ${email} on ${new Date().toISOString()}`,
          meta: {
            adminId,
            oldEmail: admin?.email,
            newEmail: email,
          },
        },
      }),
    ]);

    return updatedAdmin;
  }

  /**
   * Update admin username (piece by piece)
   * @param adminId - Admin ID
   * @param payload - Username update data
   * @returns Updated admin
   */
  async updateAdminUsername(adminId: string, payload: AdminUpdateUsernameType) {
    const { username } = payload;

    // Check if username is already in use
    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    });

    if (existingAdmin && existingAdmin.id !== adminId) {
      throw new AppError("Username already in use", 409);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { adminId: true, username: true },
    });

    const [updatedAdmin] = await Promise.all([
      prisma.admin.update({
        where: { id: adminId },
        data: { username },
        select: {
          id: true,
          adminId: true,
          email: true,
          username: true,
          name: true,
          number: true,
          avatarUrl: true,
          isSuperAdmin: true,
        },
      }),
      prisma.log.create({
        data: {
          actorId: adminId,
          action: "UPDATE_PROFILE",
          description: `${admin?.adminId} updated username from ${admin?.username} to ${username} on ${new Date().toISOString()}`,
          meta: {
            adminId,
            oldUsername: admin?.username,
            newUsername: username,
          },
        },
      }),
    ]);

    return updatedAdmin;
  }

  /**
   * Update admin name (piece by piece)
   * @param adminId - Admin ID
   * @param payload - Name update data
   * @returns Updated admin
   */
  async updateAdminName(adminId: string, payload: AdminUpdateNameType) {
    const { name } = payload;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { adminId: true, name: true },
    });

    const [updatedAdmin] = await Promise.all([
      prisma.admin.update({
        where: { id: adminId },
        data: { name },
        select: {
          id: true,
          adminId: true,
          email: true,
          username: true,
          name: true,
          number: true,
          avatarUrl: true,
          isSuperAdmin: true,
        },
      }),
      prisma.log.create({
        data: {
          actorId: adminId,
          action: "UPDATE_PROFILE",
          description: `${admin?.adminId} updated name from ${admin?.name} to ${name} on ${new Date().toISOString()}`,
          meta: {
            adminId,
            oldName: admin?.name,
            newName: name,
          },
        },
      }),
    ]);

    return updatedAdmin;
  }

  /**
   * Update admin phone number (piece by piece)
   * @param adminId - Admin ID
   * @param payload - Phone number update data
   * @returns Updated admin
   */
  async updateAdminNumber(adminId: string, payload: AdminUpdateNumberType) {
    const { number } = payload;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { adminId: true },
    });

    const [updatedAdmin] = await Promise.all([
      prisma.admin.update({
        where: { id: adminId },
        data: { number },
        select: {
          id: true,
          adminId: true,
          email: true,
          username: true,
          name: true,
          number: true,
          avatarUrl: true,
        },
      }),
      prisma.log.create({
        data: {
          actorId: adminId,
          action: "UPDATE_PROFILE",
          description: `${admin?.adminId} updated phone number to ${number} on ${new Date().toISOString()}`,
          meta: {
            adminId,
            phoneNumber: number,
          },
        },
      }),
    ]);

    return updatedAdmin;
  }

  /**
   * Update admin avatar (piece by piece)
   * @param adminId - Admin ID
   * @param payload - Avatar update data
   * @returns Updated admin
   */
  async updateAdminAvatar(adminId: string, payload: AdminUpdateAvatarType) {
    const { avatar } = payload;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { adminId: true, avatarPath: true },
    });
    let avatarUpload;
    if (admin?.avatarPath === null) {
      avatarUpload = await cloudinaryService.uploadBase64({
        base64: avatar,
        folder: "avatars",
      });
    } else {
      avatarUpload = await cloudinaryService.uploadBase64({
        base64: avatar,
        folder: "avatars",
        publicId: admin!.avatarPath,
      });
    }
    const avatarUrl = avatarUpload.url;
    const avatarPath = avatarUpload.path;
    const [updatedAdmin] = await Promise.all([
      prisma.admin.update({
        where: { id: adminId },
        data: {
          avatarUrl,
          avatarPath,
        },
        select: {
          id: true,
          adminId: true,
          email: true,
          username: true,
          name: true,
          number: true,
          avatarUrl: true,
          avatarPath: true,
        },
      }),
      prisma.log.create({
        data: {
          actorId: adminId,
          action: "UPDATE_PROFILE",
          description: `${admin?.adminId} updated avatar on ${new Date().toISOString()}`,
          meta: {
            adminId,
            avatarUrl,
            avatarPath,
          },
        },
      }),
    ]);

    return updatedAdmin;
  }

  /**
   * Update admin profile (multiple fields at once)
   * @param adminId - Admin ID
   * @param payload - Profile update data
   * @returns Updated admin
   */
  async updateAdminProfile(adminId: string, payload: AdminUpdateProfileType) {
    // Check for unique conflicts
    if (payload.email) {
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: payload.email },
      });
      if (existingAdmin && existingAdmin.id !== adminId) {
        throw new AppError("Email already in use", 409);
      }
    }

    if (payload.username) {
      const existingAdmin = await prisma.admin.findUnique({
        where: { username: payload.username },
      });
      if (existingAdmin && existingAdmin.id !== adminId) {
        throw new AppError("Username already in use", 409);
      }
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        adminId: true,
        email: true,
        username: true,
        name: true,
        number: true,
      },
    });

    const [updatedAdmin] = await Promise.all([
      prisma.admin.update({
        where: { id: adminId },
        data: {
          ...(payload.email && { email: payload.email }),
          ...(payload.username && { username: payload.username }),
          ...(payload.name && { name: payload.name }),
          ...(payload.number && { number: payload.number }),
          ...(payload.avatarUrl && { avatarUrl: payload.avatarUrl }),
          ...(payload.avatarPath && { avatarPath: payload.avatarPath }),
        },
        select: {
          id: true,
          adminId: true,
          email: true,
          username: true,
          name: true,
          number: true,
          avatarUrl: true,
          avatarPath: true,
        },
      }),
      prisma.log.create({
        data: {
          actorId: adminId,
          action: "UPDATE_PROFILE",
          description: `${admin?.adminId} updated profile on ${new Date().toISOString()}`,
          meta: {
            adminId,
            changes: {
              email: payload.email
                ? { from: admin?.email, to: payload.email }
                : null,
              username: payload.username
                ? { from: admin?.username, to: payload.username }
                : null,
              name: payload.name
                ? { from: admin?.name, to: payload.name }
                : null,
              number: payload.number ? { to: payload.number } : null,
              avatar: payload.avatarUrl ? true : false,
            },
          },
        },
      }),
    ]);

    return updatedAdmin;
  }

  /**
   * Change admin password
   * @param adminId - Admin ID
   * @param payload - Password change data
   * @returns Success message
   */
  async changeAdminPassword(adminId: string, payload: AdminChangePasswordType) {
    const { currentPassword, newPassword } = payload;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        adminId: true,
        password: true,
      },
    });

    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    const isValidPassword = await passwordService.comparePassword({
      password: currentPassword,
      hashedPassword: admin.password,
    });

    if (!isValidPassword) {
      throw new AppError("Current password is incorrect", 403);
    }

    const hashedPassword = await passwordService.hashPassword({
      password: newPassword,
    });

    await Promise.all([
      prisma.admin.update({
        where: { id: adminId },
        data: { password: hashedPassword },
      }),
      prisma.log.create({
        data: {
          actorId: adminId,
          action: "UPDATE_PROFILE",
          description: `${admin.adminId} changed password on ${new Date().toISOString()}`,
          meta: {
            adminId,
            action: "password_change",
          },
        },
      }),
    ]);

    return { message: "Password changed successfully" };
  }

  /**
   * Get admin by ID
   * @param adminId - Admin ID
   * @returns Admin data
   */
  async getAdminById(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId, isSuperAdmin: false },
      select: {
        id: true,
        adminId: true,
        email: true,
        name: true,
        number: true,
        avatarUrl: true,
        avatarPath: true,
        isDeleted: true,
      },
    });

    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    return admin;
  }

  /**
   * Get all admins
   * @returns List of admins
   */
  async getAllAdmins() {
    const admins = await prisma.admin.findMany({
      where: { isDeleted: false, isSuperAdmin: false },
      select: {
        id: true,
        adminId: true,
        email: true,
        name: true,
        number: true,
        avatarUrl: true,
        isDeleted: true,
      },
    });

    return admins;
  }
}

export const authService = new AuthService();
