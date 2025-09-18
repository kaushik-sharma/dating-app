import rateLimit from "express-rate-limit";

import { Constants } from "../constants/constants.js";
import { RedisService } from "../services/redis-service.js";

export const getDefaultRateLimiter = () =>
  rateLimit({
    windowMs: Constants.defaultRateLimiterWindowMs,
    max: Constants.defaultRateLimiterMax,
    standardHeaders: true,
    legacyHeaders: false,
    store: RedisService.hitCountStore(),
    handler: (req, res) => {
      res.status(429).json({
        message: "Too many requests, please try again later.",
      });
    },
  });
