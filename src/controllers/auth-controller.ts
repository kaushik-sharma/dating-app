import { RequestHandler } from "express";
import admin from "firebase-admin";

import { asyncHandler } from "../helpers/async-handler.js";
import { successResponseHandler } from "../helpers/success-handler.js";
import { validateData } from "../helpers/validation-helper.js";
import { phoneVerificationSchema, PhoneVerificationType } from "../validations/auth-validations.js";
import { CustomError } from "../middlewares/error-middlewares.js";
import { UserRepository } from "../repositories/user-repository.js";
import { JwtService } from "../services/jwt-service.js";
import { CreateUserType } from "../models/user-model.js";
import { withTransaction } from "../utils/transaction.js";

type FirebaseAuthIdentifier = {
  phoneNumber: string | undefined;
  email: string | undefined;
};

const _verifyFirebaseIdToken = async (idToken: string): Promise<FirebaseAuthIdentifier> => {
  const decodedToken = await admin.auth().verifyIdToken(idToken, true);

  const phoneNumber = decodedToken.phone_number;
  const email = decodedToken.email;
  const provider = decodedToken.firebase.sign_in_provider;

  if (provider !== "phone" && provider !== "google.com") {
    throw new CustomError(401, "Sign-in provider must be Phone or Google!");
  }

  return { phoneNumber, email };
};

export const AuthController = {
  validateAuthentication: ((req, res, next) => {
    req.parsedData = validateData(phoneVerificationSchema, req.body);
    next();
  }) as RequestHandler,

  authenticate: asyncHandler(async (req, res, next) => {
    const parsedData = req.parsedData! as PhoneVerificationType;

    const { phoneNumber, email } = await _verifyFirebaseIdToken(parsedData.idToken);

    let userId: string | null = await UserRepository.getUserId(phoneNumber, email);

    const authToken = await withTransaction<string>(async (session) => {
      if (!userId) {
        const data: CreateUserType = {
          phoneNumber: phoneNumber,
          email: email,
        };
        userId = await UserRepository.createUser(data, session);
      }
      return await JwtService.createAuthToken(userId, session);
    });

    successResponseHandler({
      res: res,
      status: 200,
      metadata: { message: "User authentication successful." },
      data: { authToken },
    });
  }),
};
