import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { adminFetchService } from "../services/adminFetchService";

class AdminFetchController {
  // Helper to parse numbers safely
  private getPagination = (query: any) => {
    const page = parseInt(query.page as string);
    const limit = parseInt(query.limit as string);
    return {
      page: isNaN(page) || page < 1 ? 1 : page,
      limit: isNaN(limit) || limit < 1 ? 20 : limit,
    };
  };

  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = this.getPagination(req.query);
    const q = (req.query.q as string) || undefined;

    const result = await adminFetchService.getUsers(page, limit, q);
    return res.status(200).json(result);
  });

  getPosts = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = this.getPagination(req.query);
    const q = (req.query.q as string) || undefined;

    const result = await adminFetchService.getPosts(page, limit, q);
    return res.status(200).json(result);
  });

  getReports = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = this.getPagination(req.query);
    const q = (req.query.q as string) || undefined;

    const result = await adminFetchService.getReports(page, limit, q);
    return res.status(200).json(result);
  });
}

export const adminFetchController = new AdminFetchController();
