import { Request, Response, NextFunction } from "express";
import { jwtService } from "../utils/jwtService";
import { AppError } from "../errors/appError";

export const authUserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    jwtService.attach(req);

    if (req.auth?.role !== "USER") {
      throw new AppError("User access only", 403);
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const authAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    jwtService.attach(req);

    if (req.auth?.role !== "ADMIN") {
      throw new AppError("Access denied", 403);
    }

    next();
  } catch (err) {
    next(err);
  }
};
