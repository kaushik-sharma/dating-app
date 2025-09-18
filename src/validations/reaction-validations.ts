import z from "zod";

import { ReactionType } from "../constants/enums.js";

export const createReactionSchema = z.object({
  reactionType: z.nativeEnum(ReactionType),
});

export type CreateReactionType = z.infer<typeof createReactionSchema>;
