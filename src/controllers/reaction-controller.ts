import { RequestHandler } from "express";

import { asyncHandler } from "../helpers/async-handler.js";
import { validateData } from "../helpers/validation-helper.js";
import { successResponseHandler } from "../helpers/success-handler.js";
import {
  createReactionSchema,
  CreateReactionType,
} from "../validations/reaction-validations.js";
import { CustomError } from "../middlewares/error-middlewares.js";
import { CreateReactionModelType } from "../models/reaction-model.js";
import mongoose from "mongoose";
import { ReactionRepository } from "../repositories/reaction-repository.js";
import { UserRepository } from "../repositories/user-repository.js";
import { FirebaseService } from "../services/firebase-service.js";

const _sendNotifications = async (userAId: string, userBId: string) => {
  const userAFcmToken = await UserRepository.getFcmToken(userAId);
  const userBFcmToken = await UserRepository.getFcmToken(userBId);

  if (userAFcmToken) {
    FirebaseService.sendPushNotification(
      "New Match!",
      "You have a new match. Send them the first message.",
      userAFcmToken
    );
  }

  if (userBFcmToken) {
    FirebaseService.sendPushNotification(
      "New Match!",
      "You have a new match. Send them the first message.",
      userBFcmToken
    );
  }
};

export const ReactionController = {
  validateReactionReq: ((req, res, next) => {
    req.parsedData = validateData(createReactionSchema, req.body);
    next();
  }) as RequestHandler,

  createReaction: asyncHandler(async (req, res, next) => {
    const userId = req.user!.userId;
    const parsedData = req.parsedData! as CreateReactionType;

    const recipientUserId = req.params.userId;

    if (userId === recipientUserId) {
      throw new CustomError(403, "Cannot post reaction for your own profile!");
    }

    const data: CreateReactionModelType = {
      userId: new mongoose.Types.ObjectId(userId),
      recipientUserId: new mongoose.Types.ObjectId(recipientUserId),
      reactionType: parsedData.reactionType,
    };
    await ReactionRepository.create(data);

    const mutualLikeExists = await ReactionRepository.recordExists({
      userId: recipientUserId,
      recipientUserId: userId,
    });

    if (mutualLikeExists) {
      _sendNotifications(userId, recipientUserId);
    }

    successResponseHandler({
      res: res,
      status: 200,
      metadata: { message: "Reaction saved successful." },
    });
  }),
};
