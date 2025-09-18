import { Router } from "express";

import { requireAuth } from "../middlewares/auth-middleware.js";
import { ReactionController } from "../controllers/reaction-controller.js";

export const getReactionRouter = (): Router => {
  const router = Router();

  router.post(
    "/:userId",
    requireAuth,
    ReactionController.validateReactionReq,
    ReactionController.createReaction
  );

  return router;
};
