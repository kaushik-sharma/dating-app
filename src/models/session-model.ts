import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  Types,
  model,
} from "mongoose";

const SessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { versionKey: false, timestamps: true }
);

export type SessionType = InferSchemaType<typeof SessionSchema> & {
  _id: Types.ObjectId;
};

export type SessionDocument = HydratedDocument<SessionType>;

export const SessionModel = model<SessionDocument>(
  "SessionModel",
  SessionSchema,
  "sessions"
);
