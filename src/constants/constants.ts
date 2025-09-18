import { Duration } from "luxon";
import { $enum } from "ts-enum-util";

import { Env } from "./enums.js";

export const Constants = {
  get env(): Env {
    return $enum(Env).asValueOrThrow(process.env.ENV!);
  },

  // Auth Tokens
  authTokenExpiryDurationInSec: Duration.fromObject({
    days: 30,
  }).as("seconds"),
  sessionCacheExpiryDurationInSec: Duration.fromObject({
    days: 7,
  }).as("seconds"),

  // Rate Limiter
  defaultRateLimiterWindowMs: Duration.fromObject({
    minutes: 5,
  }).as("milliseconds"),
  defaultRateLimiterMax: 100,

  // Files
  maxImageFileSizeInBytes: 1048576, // 1 MB
  allowedImageMimetypes: ["image/jpg", "image/jpeg", "image/png", "image/webp", "image/gif"],

  // User Prefs
  minAge: 18,
  maxAge: 90,
  minDistanceKm: 10,
  maxDistanceKm: 500,

  // Pagination
  pageSize: 10,
};
