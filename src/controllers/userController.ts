import { userService } from "../services/userServices.js";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  userLoginSchema,
  userSignupSchema,
  userUpdateAvatarSchema,
  userUpdateBioSchema,
  userUpdateCoverSchema,
  userUpdateEmailSchema,
  userUpdateNationalitySchema,
  userUpdateUsernameSchema,
  userUpdateDisplayNameSchema,
  userUpdateSocialsSchema,
  userChangePasswordSchema,
  updateSettingsSchema,
} from "../validation/userValidation.js";
import "dotenv/config";
import { countries } from "../data/countries.js";
import { AppError } from "../errors/appError.js";

class UserController {
  readonly secured = process.env.NODE_ENV === "production";

  /**
   * Log in a user
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const payload = userLoginSchema.parse(req.body);

    const result = await userService.login(payload);

    const expires = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: this.secured, // HTTPS only in production
      sameSite: this.secured ? "none" : "lax", // cross-origin in production
      path: "/",
      expires,
    });

    return res.status(200).json({ user: result.user });
  });

  /**
   * Register a new user
   */
  signUp = asyncHandler(async (req: Request, res: Response) => {
    const payload = userSignupSchema.parse(req.body);

    const user = await userService.signup(payload);

    return res.status(201).json({ user });
  });

  userUpdateEmail = asyncHandler(async (req: Request, res: Response) => {
    const payload = userUpdateEmailSchema.parse(req.body);
    const userId = req.auth!.id;
    const updateUser = await userService.updateUserEmail(userId, payload);
    return res.status(200).json(updateUser);
  });

  userUpdateUsername = asyncHandler(async (req: Request, res: Response) => {
    const payload = userUpdateUsernameSchema.parse(req.body);
    const userId = req.auth!.id;
    const updateUser = await userService.updateUserUsername(userId, payload);
    return res.status(200).json(updateUser);
  });

  userUpdateAvatar = asyncHandler(async (req: Request, res: Response) => {
    const payload = userUpdateAvatarSchema.parse(req.body);
    const userId = req.auth!.id;
    const updateUser = await userService.updateUserAvatar(
      userId,
      payload.avatar,
    );
    return res.status(200).json(updateUser);
  });
  userUpdateCover = asyncHandler(async (req: Request, res: Response) => {
    const payload = userUpdateCoverSchema.parse(req.body);
    const userId = req.auth!.id;
    const updateUser = await userService.updateUserCoverImage(
      userId,
      payload.cover,
    );
    return res.status(200).json(updateUser);
  });

  userUpdateBio = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const { bio } = userUpdateBioSchema.parse(req.body);
    const bioUpdate = { bio: bio ? bio : null };
    const updatedUser = await userService.updateUserBio(userId, bioUpdate.bio);
    return res.status(200).json(updatedUser);
  });

  userUpdateNationality = asyncHandler(async (req: Request, res: Response) => {
    // Read countries from JSON

    // Parse and validate body
    const q = userUpdateNationalitySchema.parse(req.body);

    // If null, allow removing nationality
    if (q.nationality === null) {
      const result = await userService.updateUserNationality(
        req.auth!.id,
        null,
      );
      return res.status(200).json(result);
    }

    // Check if the country exists in the list
    const countryExists = countries.some(
      (c) => c.toLowerCase() === q.nationality!.toLowerCase(),
    );

    if (!countryExists) {
      throw new AppError(`Invalid country: ${q.nationality}`, 400);
    }

    // Update user nationality
    const result = await userService.updateUserNationality(
      req.auth!.id,
      q.nationality,
    );
    return res.status(200).json(result);
  });

  userUpdateDisplayName = asyncHandler(async (req: Request, res: Response) => {
    const payload = userUpdateDisplayNameSchema.parse(req.body);
    const userId = req.auth!.id;
    const result = await userService.updateDisplayName(
      userId,
      payload.displayName,
    );
    return res.status(200).json(result);
  });

  userUpdateSocials = asyncHandler(async (req: Request, res: Response) => {
    const payload = userUpdateSocialsSchema.parse(req.body);
    const userId = req.auth!.id;
    const result = await userService.updateSocials(userId, payload);
    return res.status(200).json(result);
  });

  userUpdatePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = userChangePasswordSchema.parse(
      req.body,
    );
    const userId = req.auth!.id;
    await userService.changePassword(userId, currentPassword, newPassword);
    return res.status(200).json({ message: "Password updated successfully" });
  });

  userUpdateSettings = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.auth!.id;
    const settings = updateSettingsSchema.parse(req.body);
    const updatedSettings = await userService.changeSettings(userId, settings);
    return res.status(200).json(updatedSettings);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const isProduction = process.env.NODE_ENV === "production";
    // Clear cookie storing JWT with consistent security settings
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  });

  getUserPublicProfile = asyncHandler(async (req: Request, res: Response) => {
    // currentUserId might be null if you allow guests to view profiles
    const currentUserId = req.auth?.id || null;
    const { username } = req.params as { username: string };

    const user = await userService.getPublicProfile(currentUserId, username);

    res.status(200).json(user);
  });
}

export const userController = new UserController();
