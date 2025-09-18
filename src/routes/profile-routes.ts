import { Router } from "express";

import { ProfileController } from "../controllers/profile-controller.js";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { createSingleImageUploadMiddleware } from "../middlewares/file-upload-middlewares.js";

export const getProfileRouter = (): Router => {
  const router = Router();

  router.patch(
    "/",
    requireAuth,
    ProfileController.validateUpdateReq,
    ProfileController.updateProfile
  );
  router.patch(
    "/image",
    requireAuth,
    createSingleImageUploadMiddleware({ fieldName: "profileImage" }),
    ProfileController.updateImage
  );

  return router;
};
