import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { logService } from "../services/logService";
import { LogCreateType, logUpdateSchema } from "../validation/logValidation";

class LogController {
  /**
   * Update a log entry
   */
  updateLog = asyncHandler(async (req: Request, res: Response) => {
    const { logId } = req.params as { logId: string };
    const payload = logUpdateSchema.parse(req.body);

    const updatedLog = await logService.updateLog(logId, payload);
    return res.status(200).json(updatedLog);
  });

  /**
   * Get log by ID
   */
  getLogById = asyncHandler(async (req: Request, res: Response) => {
    const { logId } = req.params as { logId: string };
    const log = await logService.getLogById(logId);
    return res.status(200).json(log);
  });

  /**
   * Get all logs with pagination
   */
  getAllLogs = asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const sortBy = (req.query.sortBy as "asc" | "desc") || "desc";

    const logs = await logService.getAllLogs({
      limit,
      skip,
      sortBy,
    });

    const count = await logService.getLogCount();

    return res.status(200).json({
      logs,
      total: count,
      limit,
      skip,
    });
  });

  /**
   * Get logs by admin ID
   */
  getLogsByAdminId = asyncHandler(async (req: Request, res: Response) => {
    const { adminId } = req.params as { adminId: string };
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

    const logs = await logService.getLogsByAdminId(adminId, {
      limit,
      skip,
    });

    const count = await logService.getLogCountByAdminId(adminId);

    return res.status(200).json({
      logs,
      total: count,
      limit,
      skip,
    });
  });

  /**
   * Get logs by action type
   */
  getLogsByAction = asyncHandler(async (req: Request, res: Response) => {
    const { action } = req.params as { action: LogCreateType["action"] };
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

    const logs = await logService.getLogsByAction(action, {
      limit,
      skip,
    });

    return res.status(200).json({
      logs,
      action,
      limit,
      skip,
    });
  });

  /**
   * Get my logs (current admin)
   */
  getMyLogs = asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.auth!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

    const logs = await logService.getLogsByAdminId(adminId, {
      limit,
      skip,
    });

    const count = await logService.getLogCountByAdminId(adminId);

    return res.status(200).json({
      logs,
      total: count,
      limit,
      skip,
    });
  });

  /**
   * Get log statistics
   */
  getLogStats = asyncHandler(async (req: Request, res: Response) => {
    const totalLogs = await logService.getLogCount();
    const adminId = req.auth!.id;
    const adminLogs = await logService.getLogCountByAdminId(adminId);

    return res.status(200).json({
      totalLogs,
      adminLogs,
    });
  });
}

export const logController = new LogController();
