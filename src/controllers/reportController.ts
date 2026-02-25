import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { reportService } from "../services/reportService.js";

class ReportController {
  createReport = asyncHandler(async (req: Request, res: Response) => {
    const reporterId = req.auth!.id;
    const { reportedUserId, postId, commentId, reason, message } = req.body as {
      reportedUserId?: string;
      postId?: string;
      commentId?: string;
      reason: any;
      message?: string;
    };

    const report = await reportService.createReport({
      reporterId,
      reportedUserId,
      postId,
      commentId,
      reason,
      message,
    });

    return res.status(201).json(report);
  });

  getAllReports = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await reportService.getAllReports(page, limit);

    return res.status(200).json(result);
  });
}

export const reportController = new ReportController();
