import { RequestHandler } from "express";

import { validateData } from "../helpers/validation-helper.js";
import { updatePrefsSchema, UpdatePrefsType } from "../validations/prefs-validations.js";
import { asyncHandler } from "../helpers/async-handler.js";
import { UpdatePreferenceType } from "../models/preference-model.js";
import { successResponseHandler } from "../helpers/success-handler.js";
import { PreferencesRepository } from "../repositories/preferences-repository.js";
import { Constants } from "../constants/constants.js";
import { CustomError } from "../middlewares/error-middlewares.js";

export const PrefsController = {
  validateUpdateReq: ((req, res, next) => {
    req.parsedData = validateData(updatePrefsSchema, req.body);
    next();
  }) as RequestHandler,

  updatePreferences: asyncHandler(async (req, res, next) => {
    const userId = req.user!.userId;
    const parsedData = req.parsedData! as UpdatePrefsType;

    const ageMin = parsedData.ageMin ?? Constants.minAge;
    const ageMax = parsedData.ageMax ?? Constants.maxAge;

    if (ageMin > ageMax) {
      throw new CustomError(400, "Min age must be less than or equal to max age!");
    }

    const data: UpdatePreferenceType = {
      gender: parsedData.gender,
      ageMin: ageMin,
      ageMax: ageMax,
      travelInterests: parsedData.travelInterests,
      maxDistanceKm: parsedData.maxDistanceKm,
    };

    await PreferencesRepository.updatePrefs(userId, data);

    successResponseHandler({
      res: res,
      status: 200,
      metadata: { message: "Preferences update successful." },
    });
  }),
};
