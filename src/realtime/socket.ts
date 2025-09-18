import { Server } from "http";
import { Server as SocketIO } from "socket.io";

import { RedisService } from "../services/redis-service";

let _io: SocketIO;

export const SocketManager = {
  get io(): SocketIO {
    if (!_io) {
      throw new Error(
        "Socket.io not initialized. Call SocketManager.init(server) first."
      );
    }
    return _io;
  },

  init: (server: Server) => {
    if (_io) return;

    _io = new SocketIO(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    _io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId as string;

      // Mark online
      RedisService.client.set(`user:${userId}:isOnline`, "true", "EX", 60);
      RedisService.client.set(`user:${userId}:lastSeenAt`, new Date().toISOString());

      socket.on("disconnect", () => {
        RedisService.client.set(`user:${userId}:isOnline`, "false");
        RedisService.client.set(`user:${userId}:lastSeenAt`, new Date().toISOString());
      });
    });
  },
};
