import { Router } from "express";

import { PrefsController } from "../controllers/prefs-controller.js";
import { requireAuth } from "../middlewares/auth-middleware.js";

export const getPrefsRouter = (): Router => {
  const router = Router();

  router.patch(
    "/",
    requireAuth,
    PrefsController.validateUpdateReq,
    PrefsController.updatePreferences
  );

  return router;
};
