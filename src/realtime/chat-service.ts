import { ChatMessageModel } from "../models/chat-model.js";

async function sendMessage(senderId: string, recipientId: string, text: string) {
  const message = await ChatMessageModel.create({
    senderId,
    recipientId,
    content: text,
  });
  return message;
}

async function getConversation(userA: string, userB: string, limit = 50) {
  return ChatMessageModel.find({
    $or: [
      { senderId: userA, recipientId: userB },
      { senderId: userB, recipientId: userA },
    ],
  })
    .sort({ sentAt: -1 })
    .limit(limit)
    .lean();
}
