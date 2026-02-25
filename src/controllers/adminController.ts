import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authService } from "../services/authService";
import {
  adminLoginSchema,
  adminCreateSchema,
  adminUpdateEmailSchema,
  adminUpdateUsernameSchema,
  adminUpdateNameSchema,
  adminUpdateNumberSchema,
  adminUpdateAvatarSchema,
  adminUpdateProfileSchema,
  adminChangePasswordSchema,
} from "../validation/adminValidation";
import "dotenv/config";

class AdminController {
  /**
   * Create a new admin
   */
  createAdmin = asyncHandler(async (req: Request, res: Response) => {
    const payload = adminCreateSchema.parse(req.body);
    const actorId = req.auth?.id; // Get current admin if authenticated
    const result = await authService.createAdmin(payload, actorId);
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(201).json({
      admin: result.admin,
      message: "Admin created successfully",
    });
  });

  /**
   * Login an admin
   */
  loginAdmin = asyncHandler(async (req: Request, res: Response) => {
    const payload = adminLoginSchema.parse(req.body);
    const result = await authService.loginAdmin(payload);
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 14 * 60 * 60 * 1000,
      path: "/",
    });

    if (result.isSuperAdmin) {
      res.cookie("supaAdmin", result.admin.id, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 14 * 60 * 60 * 1000,
        path: "/",
      });
    }

    return res.status(200).json({ admin: result.admin });
  });

  /**
   * Update admin email (piece by piece)
   */
  updateEmail = asyncHandler(async (req: Request, res: Response) => {
    const payload = adminUpdateEmailSchema.parse(req.body);
    const adminId = req.auth!.id;

    const updatedAdmin = await authService.updateAdminEmail(adminId, payload);
    return res.status(200).json(updatedAdmin);
  });

  /**
   * Update admin username (piece by piece)
   */
  updateUsername = asyncHandler(async (req: Request, res: Response) => {
    const payload = adminUpdateUsernameSchema.parse(req.body);
    const adminId = req.auth!.id;

    const updatedAdmin = await authService.updateAdminUsername(
      adminId,
      payload,
    );
    return res.status(200).json(updatedAdmin);
  });

  /**
   * Update admin name (piece by piece)
   */
  updateName = asyncHandler(async (req: Request, res: Response) => {
    const payload = adminUpdateNameSchema.parse(req.body);
    const adminId = req.auth!.id;

    const updatedAdmin = await authService.updateAdminName(adminId, payload);
    return res.status(200).json(updatedAdmin);
  });

  /**
   * Update admin phone number (piece by piece)
   */
  updateNumber = asyncHandler(async (req: Request, res: Response) => {
    const payload = adminUpdateNumberSchema.parse(req.body);
    const adminId = req.auth!.id;

    const updatedAdmin = await authService.updateAdminNumber(adminId, payload);
    return res.status(200).json(updatedAdmin);
  });

  /**
   * Update admin avatar (piece by piece)
   */
  updateAvatar = asyncHandler(async (req: Request, res: Response) => {
    const payload = adminUpdateAvatarSchema.parse(req.body);
    const adminId = req.auth!.id;

    const updatedAdmin = await authService.updateAdminAvatar(adminId, payload);
    return res.status(200).json(updatedAdmin);
  });

  /**
   * Update admin profile (multiple fields)
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const payload = adminUpdateProfileSchema.parse(req.body);
    const adminId = req.auth!.id;

    const updatedAdmin = await authService.updateAdminProfile(adminId, payload);
    return res.status(200).json(updatedAdmin);
  });

  /**
   * Change admin password
   */
  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const payload = adminChangePasswordSchema.parse(req.body);
    const adminId = req.auth!.id;

    const result = await authService.changeAdminPassword(adminId, payload);
    return res.status(200).json(result);
  });

  /**
   * Get admin by ID
   */
  getAdminById = asyncHandler(async (req: Request, res: Response) => {
    const { adminId } = req.params as { adminId: string };
    const admin = await authService.getAdminById(adminId);
    return res.status(200).json(admin);
  });

  /**
   * Get all admins
   */
  getAllAdmins = asyncHandler(async (req: Request, res: Response) => {
    const admins = await authService.getAllAdmins();
    return res.status(200).json(admins);
  });

  /**
   * Get current admin profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.auth!.id;
    const admin = await authService.getAdminById(adminId);
    return res.status(200).json(admin);
  });
}

export const adminController = new AdminController();
