import admin from "firebase-admin";
import { Message } from "firebase-admin/lib/messaging/messaging-api.js";

import logger from "../utils/logger.js";

export const FirebaseService = {
  initApp: () => {
    try {
      admin.initializeApp({
        credential: admin.credential.cert("./serviceAccountKey.json"),
      });
      logger.info("Successfully connected to Firebase!");
    } catch (err) {
      logger.error("Error connecting to Firebase.", err);
      logger.error("Exiting process.");
      process.exit(0);
    }
  },

  sendPushNotification: async (title: string, body: string, fcmToken: string) => {
    const message: Message = {
      notification: {
        title,
        body,
      },
      token: fcmToken,
    };

    try {
      const fcm = admin.messaging();
      const response = await fcm.send(message);
      console.log("Push notification sent:", response);
    } catch (err) {
      logger.error("Error sending push notification:", err);
    }
  },
};
