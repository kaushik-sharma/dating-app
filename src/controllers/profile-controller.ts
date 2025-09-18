import { RequestHandler } from "express";

import { asyncHandler } from "../helpers/async-handler.js";
import { validateData } from "../helpers/validation-helper.js";
import { updateProfileSchema, UpdateProfileType } from "../validations/profile-validations.js";
import { UpdateUserType } from "../models/user-model.js";
import { UserRepository } from "../repositories/user-repository.js";
import { successResponseHandler } from "../helpers/success-handler.js";
import { SupabaseStorageService } from "../services/supabase-storage-service.js";

export const ProfileController = {
  validateUpdateReq: ((req, res, next) => {
    req.parsedData = validateData(updateProfileSchema, req.body);
    next();
  }) as RequestHandler,

  updateProfile: asyncHandler(async (req, res, next) => {
    const userId = req.user!.userId;
    const parsedData = req.parsedData! as UpdateProfileType;

    const data: UpdateUserType = {
      name: parsedData.name,
      gender: parsedData.gender,
      dob: parsedData.dob,
      travelInterests: parsedData.travelInterests,
      location: parsedData.location
        ? {
            type: "Point",
            coordinates: [parsedData.location.longitude, parsedData.location.latitude],
          }
        : undefined,
    };

    await UserRepository.updateProfile(userId, data);

    successResponseHandler({
      res: res,
      status: 200,
      metadata: { message: "Profile update successful." },
    });
  }),

  updateImage: asyncHandler(async (req, res, next) => {
    const userId = req.user!.userId;

    const imageFile = req.file as Express.Multer.File;
    const fileName = await SupabaseStorageService.uploadFile(imageFile);

    await UserRepository.updateProfileImage(userId, fileName);

    successResponseHandler({
      res: res,
      status: 200,
      metadata: { message: "Profile image update successful." },
    });
  }),
};
