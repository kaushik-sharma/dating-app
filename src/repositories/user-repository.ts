import mongoose, { ClientSession } from "mongoose";
import { CreateUserType, UpdateUserType, UserModel } from "../models/user-model.js";
import { CustomError } from "../middlewares/error-middlewares.js";

export const UserRepository = {
  getUserId: async (
    phoneNumber: string | undefined,
    email: string | undefined
  ): Promise<string | null> => {
    const filter: Record<string, string> = {};
    if (phoneNumber) filter.phoneNumber = phoneNumber;
    if (email) filter.email = email;

    const userDoc = await UserModel.findOne(filter, { _id: 1 });
    return userDoc?._id.toString() ?? null;
  },

  createUser: async (data: CreateUserType, session: ClientSession): Promise<string> => {
    try {
      const model = new UserModel(data);
      const userDoc = await model.save({ session: session });
      return userDoc._id.toString();
    } catch (err: any) {
      // Check if it's a duplicate key error
      if (
        (err instanceof mongoose.Error || err.name === "MongoServerError") &&
        err.code === 11000
      ) {
        // Field that caused duplicate
        const field = Object.keys(err.keyValue)[0];
        if (field === "phoneNumber") {
          throw new CustomError(409, "This phone number is already used!");
        } else if (field === "email") {
          throw new CustomError(409, "This email is already used!");
        }
      }

      throw err;
    }
  },

  updateProfile: async (userId: string, data: UpdateUserType) => {
    await UserModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: data }
    );
  },

  updateProfileImage: async (userId: string, fileName: string) => {
    await UserModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { profileImagePath: fileName } }
    );
  },

  getUserLocation: async (userId: string) => {
    const userDoc = await UserModel.findById(userId, { _id: false, location: true });
    return {
      latitude: userDoc!.location!.coordinates[1],
      longitude: userDoc!.location!.coordinates[0],
    };
  },

  getFcmToken: async (userId: string): Promise<string | null | undefined> => {
    const userDoc = await UserModel.findById(userId, { _id: false, fcmToken: true });
    return userDoc!.fcmToken;
  },
};
