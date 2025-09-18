import Redis from "ioredis";
import RedisStore from "rate-limit-redis";

import logger from "../utils/logger.js";

export class RedisService {
  static #client: Redis;

  static get client(): Redis {
    if (!this.#client) {
      throw new Error("Redis client not initialized. Call initClient() first.");
    }
    return this.#client;
  }

  static readonly initClient = async (): Promise<void> => {
    if (this.#client) return;

    try {
      this.#client = new Redis({
        host: process.env.REDIS_HOST!,
        port: Number(process.env.REDIS_PORT!),
        username: process.env.REDIS_USERNAME!,
        password: process.env.REDIS_PASSWORD!,
        lazyConnect: true,
        enableReadyCheck: false,
      });
      await this.#client.connect();
      logger.info("Successfully connected to Redis!");
    } catch (err) {
      logger.error("Error connecting to Redis.", err);
      logger.error("Exiting process.");
      process.exit(0);
    }
  };

  static readonly hitCountStore = (): RedisStore => {
    return new RedisStore({
      // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
      sendCommand: (...args: string[]) => this.#client.call(...args),
    });
  };
}
