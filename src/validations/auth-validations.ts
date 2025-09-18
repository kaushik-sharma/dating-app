import { z } from "zod";

export const phoneVerificationSchema = z.object({
  idToken: z.string().trim(),
});

export type PhoneVerificationType = z.infer<typeof phoneVerificationSchema>;
