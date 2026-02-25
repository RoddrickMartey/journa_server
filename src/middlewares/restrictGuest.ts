import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/appError.js";

export const restrictGuest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Assuming your auth middleware populates req.auth with user info
  if (req.auth?.id === "54ae7770-b511-4d6b-8eb0-67666a148719") {
    throw new AppError("Guest users cannot perform this action.", 403);
  }
  next();
};
