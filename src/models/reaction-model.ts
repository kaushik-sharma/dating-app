import { HydratedDocument, InferSchemaType, model, Schema, Types } from "mongoose";

import { ReactionType } from "../constants/enums.js";

const ReactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reactionType: { type: String, enum: ReactionType, required: true },
  },
  { versionKey: false, timestamps: true }
);

ReactionSchema.index({ userId: 1, recipientUserId: 1 }, { unique: true });

export type ReactionModelType = InferSchemaType<typeof ReactionSchema> & {
  _id: Types.ObjectId;
};
export type CreateReactionModelType = Pick<
  InferSchemaType<typeof ReactionSchema>,
  "userId" | "recipientUserId" | "reactionType"
>;
export type ReactionDocument = HydratedDocument<ReactionModelType>;

export const ReactionModel = model<ReactionDocument>(
  "ReactionModel",
  ReactionSchema,
  "reactions"
);
