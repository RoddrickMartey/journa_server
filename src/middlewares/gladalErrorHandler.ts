import { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      logout: err.logout || false,
    });
  }

  console.error(err); // Unexpected error
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
};
