import mongoose from "mongoose";

import logger from "../utils/logger.js";

export class MongooseService {
  static readonly connect = async () => {
    try {
      const uri = process.env.MONGODB_URI!;
      const clientOptions: mongoose.ConnectOptions = {
        serverApi: { version: "1", strict: true, deprecationErrors: true },
      };

      await mongoose.connect(uri, clientOptions);
      await mongoose.connection.db!.admin().command({ ping: 1 });
      logger.info("Successfully connected to MongoDB!");
    } catch (err) {
      logger.error("Error connecting to MongoDB.", err);
      logger.error("Exiting process.");
      process.exit(0);
    }
  };
}
