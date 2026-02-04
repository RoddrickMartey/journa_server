import { prisma } from "../db/client";
import { AppError } from "../errors/appError";
import { LogCreateType, LogUpdateType } from "../validation/logValidation";

class LogService {
  /**
   * Create a new log entry
   * @param adminId - Admin ID who performed the action
   * @param payload - Log creation data
   * @returns Created log entry
   */
  async createLog(adminId: string, payload: LogCreateType) {
    const { action, description, meta } = payload;

    // Verify admin exists
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    const log = await prisma.log.create({
      data: {
        actorId: adminId,
        action,
        description,
        meta: meta || {},
      },
      select: {
        id: true,
        actor: {
          select: {
            id: true,
            adminId: true,
            username: true,
            email: true,
            name: true,
          },
        },
        action: true,
        description: true,
        meta: true,
        createdAt: true,
      },
    });

    return log;
  }

  /**
   * Update a log entry
   * @param logId - Log ID to update
   * @param payload - Log update data
   * @returns Updated log entry
   */
  async updateLog(logId: string, payload: LogUpdateType) {
    const { description, meta } = payload;

    // Verify log exists
    const log = await prisma.log.findUnique({
      where: { id: logId },
    });

    if (!log) {
      throw new AppError("Log entry not found", 404);
    }

    const updatedLog = await prisma.log.update({
      where: { id: logId },
      data: {
        ...(description && { description }),
        ...(meta && { meta }),
      },
      select: {
        id: true,
        actor: {
          select: {
            id: true,
            adminId: true,
            username: true,
            email: true,
            name: true,
          },
        },
        action: true,
        description: true,
        meta: true,
        createdAt: true,
      },
    });

    return updatedLog;
  }

  /**
   * Get a log entry by ID
   * @param logId - Log ID
   * @returns Log entry
   */
  async getLogById(logId: string) {
    const log = await prisma.log.findUnique({
      where: { id: logId },
      select: {
        id: true,
        actor: {
          select: {
            id: true,
            adminId: true,
            username: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        action: true,
        description: true,
        meta: true,
        createdAt: true,
      },
    });

    if (!log) {
      throw new AppError("Log entry not found", 404);
    }

    return log;
  }

  /**
   * Get all logs
   * @param options - Query options (limit, skip, etc.)
   * @returns List of logs
   */
  async getAllLogs(options?: {
    limit?: number;
    skip?: number;
    sortBy?: "asc" | "desc";
  }) {
    const limit = options?.limit || 50;
    const skip = options?.skip || 0;
    const orderBy = options?.sortBy === "asc" ? "asc" : "desc";

    const logs = await prisma.log.findMany({
      select: {
        id: true,
        actor: {
          select: {
            id: true,
            adminId: true,
            username: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        action: true,
        description: true,
        meta: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: orderBy,
      },
      take: limit,
      skip,
    });

    return logs;
  }

  /**
   * Get logs by admin ID
   * @param adminId - Admin ID
   * @param options - Query options
   * @returns List of logs from that admin
   */
  async getLogsByAdminId(
    adminId: string,
    options?: { limit?: number; skip?: number },
  ) {
    const limit = options?.limit || 50;
    const skip = options?.skip || 0;

    const logs = await prisma.log.findMany({
      where: { actorId: adminId },
      select: {
        id: true,
        actor: {
          select: {
            id: true,
            adminId: true,
            username: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        action: true,
        description: true,
        meta: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip,
    });

    return logs;
  }

  /**
   * Get logs by action type
   * @param action - Log action type
   * @param options - Query options
   * @returns List of logs with that action
   */
  async getLogsByAction(
    action: LogCreateType["action"],
    options?: { limit?: number; skip?: number },
  ) {
    const limit = options?.limit || 50;
    const skip = options?.skip || 0;

    const logs = await prisma.log.findMany({
      where: { action },
      select: {
        id: true,
        actor: {
          select: {
            id: true,
            adminId: true,
            username: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        action: true,
        description: true,
        meta: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip,
    });

    return logs;
  }

  /**
   * Get log count
   * @returns Total number of logs
   */
  async getLogCount() {
    const count = await prisma.log.count();
    return count;
  }

  /**
   * Get log count by admin ID
   * @param adminId - Admin ID
   * @returns Number of logs from that admin
   */
  async getLogCountByAdminId(adminId: string) {
    const count = await prisma.log.count({
      where: { actorId: adminId },
    });
    return count;
  }
}

export const logService = new LogService();
