import jwt from "jsonwebtoken";
import fs from "fs";

import { Constants } from "../constants/constants.js";
import { AuthenticatedUser } from "../@types/custom.js";
import { CustomError } from "../middlewares/error-middlewares.js";
import { RedisService } from "./redis-service.js";
import { SessionDocument, SessionModel } from "../models/session-model.js";
import mongoose from "mongoose";

export const JwtService = {
  get privateKey(): string {
    return fs.readFileSync(process.env.JWT_PRIVATE_KEY_FILE_NAME!, "utf8");
  },
  get publicKey(): string {
    return fs.readFileSync(process.env.JWT_PUBLIC_KEY_FILE_NAME!, "utf8");
  },
  get authTokenSignOptions(): jwt.SignOptions {
    const options: jwt.SignOptions = {
      algorithm: "PS512",
      expiresIn: Constants.authTokenExpiryDurationInSec,
      keyid: "ps512-v1",
      audience: "https://valid-hip-catfish.ngrok-free.app",
    };
    return options;
  },
  verifyJwt: (token: string): jwt.JwtPayload => {
    try {
      const verifyOptions: jwt.VerifyOptions = {
        algorithms: [JwtService.authTokenSignOptions.algorithm!],
        audience: JwtService.authTokenSignOptions.audience as string,
        issuer: JwtService.authTokenSignOptions.issuer,
      };

      return jwt.verify(token, JwtService.publicKey, verifyOptions) as jwt.JwtPayload;
    } catch (err: any) {
      if (err.name === jwt.TokenExpiredError.name) {
        throw new CustomError(401, "Auth token expired.");
      }
      throw err;
    }
  },
  createAuthToken: async (
    userId: string,
    clientSession?: mongoose.ClientSession
  ): Promise<string> => {
    const sessionDoc = new SessionModel({ userId });
    await sessionDoc.save({ session: clientSession });

    await RedisService.client.set(
      `sessions:${sessionDoc._id}`,
      JSON.stringify({ userId }),
      "EX",
      Constants.sessionCacheExpiryDurationInSec
    );

    const payload = { sessionId: sessionDoc._id, userId, v: 1 };

    return jwt.sign(payload, JwtService.privateKey, JwtService.authTokenSignOptions);
  },
  verifyAuthToken: async (token: string): Promise<AuthenticatedUser> => {
    const decoded = JwtService.verifyJwt(token);

    const sessionId = decoded.sessionId as string | null | undefined;
    const userId = decoded.userId as string | null | undefined;

    if (!sessionId || !userId) {
      throw new CustomError(401, "Invalid auth token.");
    }

    const cachedSessionData = await RedisService.client.get(`sessions:${sessionId}`);
    let dbSessionData: Pick<SessionDocument, "userId"> | null = null;

    if (cachedSessionData === null) {
      dbSessionData = await SessionModel.findOne({ _id: sessionId }, { _id: 0, userId: 1 });
    }

    if (!cachedSessionData && !dbSessionData) {
      throw new CustomError(404, "Session not found.");
    }

    const savedUserId =
      cachedSessionData !== null
        ? (JSON.parse(cachedSessionData)["userId"] as string)
        : dbSessionData!.userId;

    if (userId !== savedUserId) {
      throw new CustomError(409, "Wrong user ID in the auth token.");
    }

    if (cachedSessionData === null) {
      await RedisService.client.set(
        `sessions:${sessionId}`,
        JSON.stringify({ userId }),
        "EX",
        Constants.sessionCacheExpiryDurationInSec
      );
    }

    return { sessionId, userId };
  },
  getRefreshToken: (user: AuthenticatedUser): string => {
    const payload = { ...user, v: 1 };
    return jwt.sign(payload, JwtService.privateKey, JwtService.authTokenSignOptions);
  },
} as const;
