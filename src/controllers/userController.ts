import { userService } from "../services/userServices";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
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
} from "../validation/userValidation";
import "dotenv/config";
import { countries } from "../data/countries";
import { AppError } from "../errors/appError";

class UserController {
  /**
   * Log in a user
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const payload = userLoginSchema.parse(req.body);

    const result = await userService.login(payload);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 4 * 24 * 60 * 60 * 1000, // 4 days
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
}

export const userController = new UserController();
