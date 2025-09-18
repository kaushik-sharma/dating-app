import { Request } from "express";

import { EntityStatus } from "../constants/enums.js";

interface AuthenticatedUser {
  sessionId: string;
  userId: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
    parsedData?: any;
  }
}
