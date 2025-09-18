import { HydratedDocument, InferSchemaType, Schema, Types, model } from "mongoose";

const ChatMessageSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "UserModel", required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: "UserModel", required: true },
    content: { type: String, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

ChatMessageSchema.index({ senderId: 1, recipientId: 1 });

export type ChatMessageType = InferSchemaType<typeof ChatMessageSchema> & {
  _id: Types.ObjectId;
};

export type ChatMessageDocument = HydratedDocument<ChatMessageType>;

export const ChatMessageModel = model<ChatMessageDocument>(
  "ChatMessageModel",
  ChatMessageSchema,
  "chat_messages"
);
