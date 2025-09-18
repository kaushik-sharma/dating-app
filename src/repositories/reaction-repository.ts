import { ReactionType } from "../constants/enums.js";
import { CreateReactionModelType, ReactionModel } from "../models/reaction-model.js";

export const ReactionRepository = {
  create: async (data: CreateReactionModelType) => {
    await ReactionModel.updateOne(
      { userId: data.userId, recipientUserId: data.recipientUserId },
      { $set: data },
      { upsert: true }
    );
  },

  recordExists: async ({
    userId,
    recipientUserId,
  }: {
    userId: string;
    recipientUserId: string;
  }) => {
    const count = await ReactionModel.countDocuments({
      userId,
      recipientUserId,
      reactionType: ReactionType.LIKE,
    });
    return count > 0;
  },
};
