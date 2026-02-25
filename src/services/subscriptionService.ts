import { prisma } from "../db/client.js";
import { AppError } from "../errors/appError.js";

class SubscriptionService {
  async toggleSubscription(subscriberId: string, subscribedId: string) {
    // Check if subscriber is suspended
    const subscriber = await prisma.user.findUnique({
      where: { id: subscriberId },
      select: { suspended: true },
    });

    if (subscriber?.suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    if (subscriberId === subscribedId) {
      throw new AppError("You cannot subscribe to yourself", 400);
    }

    // ✅ Block check (mutual)
    const blockExists = await prisma.block.findFirst({
      where: {
        OR: [
          {
            blockerId: subscriberId,
            blockedId: subscribedId,
          },
          {
            blockerId: subscribedId,
            blockedId: subscriberId,
          },
        ],
      },
    });

    if (blockExists) {
      throw new AppError("Subscription not allowed", 403);
    }

    const existing = await prisma.subscription.findUnique({
      where: {
        subscriberId_subscribedId: { subscriberId, subscribedId },
      },
    });

    if (existing) {
      await prisma.subscription.delete({
        where: {
          subscriberId_subscribedId: { subscriberId, subscribedId },
        },
      });

      return { subscribed: false };
    }

    await prisma.subscription.create({
      data: { subscriberId, subscribedId },
    });

    return { subscribed: true };
  }
}

export const subscriptionService = new SubscriptionService();
