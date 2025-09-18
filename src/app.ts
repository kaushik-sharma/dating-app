import http from "http";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { MongooseService } from "./services/mongoose-service.js";
import { getDefaultRateLimiter } from "./middlewares/rate-limiter-middlewares.js";
import { errorHandler } from "./middlewares/error-middlewares.js";
import { hitCounter } from "./middlewares/hit-counter-middleware.js";
import logger from "./utils/logger.js";
import { RedisService } from "./services/redis-service.js";
import { getHealthCheckRouter } from "./routes/health-check-routes.js";
import { getAuthRouter } from "./routes/auth-routes.js";
import { getProfileRouter } from "./routes/profile-routes.js";
import { getPrefsRouter } from "./routes/prefs-routes.js";
import { getConnectionsRouter } from "./routes/connection-routes.js";
import { getReactionRouter } from "./routes/reaction-routes.js";
import { Constants } from "./constants/constants.js";
import { FirebaseService } from "./services/firebase-service.js";
import { SocketManager } from "./realtime/socket.js";

dotenv.config({ path: `.env.${Constants.env.toLowerCase()}` });

await MongooseService.connect();
await RedisService.initClient();
FirebaseService.initApp();

const app = express();

app.use(helmet());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(express.json({ limit: "100kb" }));

app.use(hitCounter());

app.use(getDefaultRateLimiter());

app.use("/api/health", getHealthCheckRouter());

app.use("/api/v1/auth", getAuthRouter());
app.use("/api/v1/profile", getProfileRouter());
app.use("/api/v1/preferences", getPrefsRouter());
app.use("/api/v1/connections", getConnectionsRouter());
app.use("/api/v1/reaction", getReactionRouter());

app.use(errorHandler);

process.on("unhandledRejection", (reason, promise) => {
  console.error(reason);
});
process.on("uncaughtException", (error, origin) => {
  console.error(error);
  console.error(origin);
});

const server = http.createServer(
  {
    maxHeaderSize: 8192, // 8 kB
  },
  app
);

SocketManager.init(server);

server.listen(3000, "0.0.0.0", () => {
  logger.info("Server running at http://localhost:3000/");
});
