import { PreferenceModel, UpdatePreferenceType } from "../models/preference-model.js";

export const PreferencesRepository = {
  updatePrefs: async (userId: string, data: UpdatePreferenceType) => {
    await PreferenceModel.updateOne({ userId }, { $set: data }, { upsert: true });
  },

  getUserPrefs: async (userId: string) => {
    return await PreferenceModel.findOne(
      { userId },
      {
        _id: 0,
        userId: 0,
        createdAt: 0,
        updatedAt: 0,
      }
    );
  },
};
