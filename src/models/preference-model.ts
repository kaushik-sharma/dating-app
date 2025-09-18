import { HydratedDocument, InferSchemaType, model, Schema, Types } from "mongoose";

import { Gender } from "../constants/enums.js";

const PreferenceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    gender: { type: String, enum: Gender, default: null },
    ageMin: { type: Number, default: null },
    ageMax: { type: Number, default: null },
    travelInterests: { type: [String], default: null },
    maxDistanceKm: { type: Number, default: null },
  },
  { versionKey: false, timestamps: true }
);

PreferenceSchema.index({ userId: 1 }, { unique: true });

export type PreferenceType = InferSchemaType<typeof PreferenceSchema> & {
  _id: Types.ObjectId;
};
export type UpdatePreferenceType = Partial<
  Pick<
    InferSchemaType<typeof PreferenceSchema>,
    "gender" | "ageMin" | "ageMax" | "travelInterests" | "maxDistanceKm"
  >
>;
export type PreferenceDocument = HydratedDocument<PreferenceType>;

export const PreferenceModel = model<PreferenceDocument>(
  "PreferenceModel",
  PreferenceSchema,
  "preferences"
);
