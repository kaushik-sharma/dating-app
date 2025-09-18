import { Router } from "express";

import { requireAuth } from "../middlewares/auth-middleware.js";
import { ConnectionsController } from "../controllers/connections-controller.js";

export const getConnectionsRouter = (): Router => {
  const router = Router();

  router.get("/feed/:page", requireAuth, ConnectionsController.getFeed);
  router.get("/matches", requireAuth, ConnectionsController.getMatches);

  return router;
};
