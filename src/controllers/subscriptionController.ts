import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { subscriptionService } from "../services/subscriptionService.js";

class SubscriptionController {
  toggleSubscription = asyncHandler(async (req: Request, res: Response) => {
    const subscriberId = req.auth!.id;
    const { subscribedId } = req.params as { subscribedId: string };

    await subscriptionService.toggleSubscription(subscriberId, subscribedId);

    res.status(200).json({
      success: true,
      message: "Subscription toggled",
    });
  });
}

export const subscriptionController = new SubscriptionController();
