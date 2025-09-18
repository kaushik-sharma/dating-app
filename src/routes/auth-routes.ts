import { Router } from "express";

import { AuthController } from "../controllers/auth-controller.js";

export const getAuthRouter = (): Router => {
  const router = Router();

  router.post("/", AuthController.validateAuthentication, AuthController.authenticate);

  return router;
};
