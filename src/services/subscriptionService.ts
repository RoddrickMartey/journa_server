import { prisma } from "../db/client";
import { AppError } from "../errors/appError";

class SubscriptionService {
  /**
   * Toggles the subscription between two users.
   */
  async toggleSubscription(subscriberId: string, subscribedId: string) {
    if (subscriberId === subscribedId) {
      throw new AppError("You cannot subscribe to yourself", 400);
    }

    // Check if subscription already exists using the composite unique key
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_subscribedId: { subscriberId, subscribedId },
      },
    });

    if (existingSubscription) {
      return await prisma.subscription.delete({
        where: {
          subscriberId_subscribedId: { subscriberId, subscribedId },
        },
      });
    }

    return await prisma.subscription.create({
      data: { subscriberId, subscribedId },
    });
  }
}

export const subscriptionService = new SubscriptionService();
