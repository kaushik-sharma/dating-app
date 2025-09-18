import mongoose from "mongoose";

import { asyncHandler } from "../helpers/async-handler.js";
import { PreferencesRepository } from "../repositories/preferences-repository.js";
import { successResponseHandler } from "../helpers/success-handler.js";
import { Constants } from "../constants/constants.js";
import { UserRepository } from "../repositories/user-repository.js";
import { UserModel } from "../models/user-model.js";
import { UserDto } from "../dtos/user-dto.js";
import { SupabaseStorageService } from "../services/supabase-storage-service.js";
import { ReactionModel } from "../models/reaction-model.js";
import { ReactionType } from "../constants/enums.js";

const _dobRangeFromAgeLimits = (ageMin: number, ageMax: number) => {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  const maxDob = new Date(y - ageMin, m, d);
  const minDob = new Date(y - ageMax, m, d);
  minDob.setDate(minDob.getDate());

  return { minDob, maxDob };
};

export const ConnectionsController = {
  getFeed: asyncHandler(async (req, res, next) => {
    const userId = req.user!.userId;

    const userLocation = await UserRepository.getUserLocation(userId);

    const userPrefs = await PreferencesRepository.getUserPrefs(userId);

    const gender = userPrefs?.gender;
    const ageMin = userPrefs?.ageMin ?? Constants.minAge;
    const ageMax = userPrefs?.ageMax ?? Constants.maxAge;
    const travelInterests = userPrefs?.travelInterests ?? [];
    const maxDistanceKm = userPrefs?.maxDistanceKm ?? Constants.maxDistanceKm;
    const maxDistanceMeters = maxDistanceKm * 1000;

    const filter: any = {};

    // Exclude current user
    filter._id = { $ne: userId };

    // Fetch all userIds I have disliked
    const dislikedDocs = await ReactionModel.find({
      userId: userId,
      reactionType: ReactionType.DISLIKE,
    })
      .select("recipientUserId")
      .lean();

    const dislikedIds = dislikedDocs.map((d) => d.recipientUserId);

    if (dislikedIds.length > 0) {
      filter._id = { ...filter._id, $nin: dislikedIds };
    }

    // Gender filter (if provided)
    if (gender) {
      filter.gender = gender;
    }

    // Age filter
    const { minDob, maxDob } = _dobRangeFromAgeLimits(ageMin, ageMax);
    filter.dob = {
      $gte: minDob.toISOString().split("T")[0],
      $lte: maxDob.toISOString().split("T")[0],
    };

    // Interests filter
    if (travelInterests.length > 0) {
      filter.travelInterests = { $in: travelInterests };
    }

    // Adding geo filter for distance using $nearSphere
    filter.location = {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [userLocation.longitude, userLocation.latitude],
        },
        $maxDistance: maxDistanceMeters,
      },
    };

    // Pagination
    const page = Number(req.params.page);
    const skip = page * Constants.pageSize;

    const results = await UserModel.find(filter, {
      phoneNumber: false,
      email: false,
      location: false,
      createdAt: false,
      updatedAt: false,
    })
      .skip(skip)
      .limit(Constants.pageSize)
      .lean();

    const users: UserDto[] = [];
    for (const doc of results) {
      users.push(
        new UserDto({
          id: doc._id.toString(),
          name: doc.name,
          gender: doc.gender,
          dob: doc.dob,
          travelInterests: doc.travelInterests,
          profileImageUrl: doc.profileImagePath
            ? await SupabaseStorageService.getSignedDownloadUrl(doc.profileImagePath!)
            : null,
        })
      );
    }

    successResponseHandler({
      res: res,
      status: 200,
      metadata: { message: "Feed fetch successful." },
      data: users,
    });
  }),

  getMatches: asyncHandler(async (req, res, next) => {
    const userId = req.user!.userId;

    // Users I liked
    const likedDocs = await ReactionModel.find({
      userId: userId,
      reactionType: ReactionType.LIKE,
    })
      .select("recipientUserId")
      .lean();

    // Users who liked me
    const likedMeDocs = await ReactionModel.find({
      recipientUserId: userId,
      reactionType: ReactionType.LIKE,
    })
      .select("userId")
      .lean();

    const likedIds = likedDocs.map((doc) => doc.recipientUserId.toString());
    const likedMeIds = likedMeDocs.map((doc) => doc.userId.toString());

    // Intersection = mutual connections
    const mutualIdsSet = new Set(likedIds.filter((id) => likedMeIds.includes(id)));
    const mutualIdsObjectIds = Array.from(mutualIdsSet).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Fetch user profiles
    const results = await UserModel.find(
      {
        _id: {
          $in: mutualIdsObjectIds,
        },
      },
      {
        phoneNumber: false,
        email: false,
        location: false,
        createdAt: false,
        updatedAt: false,
      }
    ).lean();

    const users: UserDto[] = [];
    for (const doc of results) {
      users.push(
        new UserDto({
          id: doc._id.toString(),
          name: doc.name,
          gender: doc.gender,
          dob: doc.dob,
          travelInterests: doc.travelInterests,
          profileImageUrl: doc.profileImagePath
            ? await SupabaseStorageService.getSignedDownloadUrl(doc.profileImagePath!)
            : null,
        })
      );
    }

    successResponseHandler({
      res: res,
      status: 200,
      metadata: { message: "Match fetch successful." },
      data: users,
    });
  }),
};
