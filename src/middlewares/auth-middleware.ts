import { RequestHandler } from "express";

import { JwtService } from "../services/jwt-service.js";

export const requireAuth: RequestHandler = async (req, res, next) => {
  const token = req.headers["authorization"] as string;
  req.user = await JwtService.verifyAuthToken(token);
  next();
};
