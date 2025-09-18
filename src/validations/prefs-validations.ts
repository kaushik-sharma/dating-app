import z from "zod";

import { Gender } from "../constants/enums.js";
import { Constants } from "../constants/constants.js";

export const updatePrefsSchema = z.object({
  gender: z.nativeEnum(Gender).optional(),
  ageMin: z
    .number()
    .int()
    .min(Constants.minAge)
    .max(Constants.maxAge)
    .optional(),
  ageMax: z
    .number()
    .int()
    .min(Constants.minAge)
    .max(Constants.maxAge)
    .optional(),
  travelInterests: z
    .array(z.string().min(1))
    .nonempty({ message: "Travel interests must contain at least one item" })
    .optional(),
  maxDistanceKm: z.number().int().min(Constants.minDistanceKm).max(Constants.maxDistanceKm).optional(),
});

export type UpdatePrefsType = z.infer<typeof updatePrefsSchema>;
