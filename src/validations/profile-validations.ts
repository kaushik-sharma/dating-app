import z from "zod";

import { Gender } from "../constants/enums.js";

export const updateProfileSchema = z.object({
  name: z.string().trim().nonempty().max(30).optional(),
  gender: z.nativeEnum(Gender).optional(),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Date of birth must be in YYYY-MM-DD format",
    })
    .refine(
      (dob) => {
        const date = new Date(dob);
        return !isNaN(date.getTime());
      },
      { message: "Invalid date format!" }
    )
    .refine(
      (dob) => {
        const date = new Date(dob);

        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        const d = today.getDate() - date.getDate();

        // Adjust if birthday hasn't occurred yet this year
        if (m < 0 || (m === 0 && d < 0)) age--;

        return age >= 18;
      },
      {
        message: "You must be at least 18 years old",
      }
    )
    .optional(),
  travelInterests: z
    .array(z.string().min(1))
    .nonempty({ message: "Travel interests must contain at least one item" })
    .optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
});

export type UpdateProfileType = z.infer<typeof updateProfileSchema>;
