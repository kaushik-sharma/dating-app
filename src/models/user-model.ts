import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";

import { Gender } from "../constants/enums.js";

const UserSchema = new Schema(
  {
    name: { type: String, default: null },
    phoneNumber: { type: String, index: true, required: false, default: null },
    email: { type: String, index: true, required: false, default: null },
    gender: { type: String, enum: Gender, default: null },
    dob: {
      type: String,
      default: null,
    },
    travelInterests: {
      type: [String],
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: null,
      },
      coordinates: {
        type: [Number],
        default: null,
      },
    },
    profileImagePath: { type: String, required: false, default: null },
    fcmToken: { type: String, required: false, default: null },
  },
  { versionKey: false, timestamps: true }
);

UserSchema.index({ location: "2dsphere" });

export type CreateUserType = Pick<
  InferSchemaType<typeof UserSchema>,
  "email" | "phoneNumber"
>;
export type UpdateUserType = Partial<
  Pick<
    InferSchemaType<typeof UserSchema>,
    "name" | "gender" | "dob" | "travelInterests" | "location"
  >
>;
export type UserType = InferSchemaType<typeof UserSchema>;
export type UserDocument = HydratedDocument<UserType>;

export const UserModel = model<UserDocument>("UserModel", UserSchema, "users");
