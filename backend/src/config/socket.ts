import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "./env.js";

export function createSocketServer(server: HttpServer) {
	const io = new Server(server, {
		cors: {
			origin: env.frontendOrigin,
			credentials: true
		}
	});

	io.on("connection", (socket) => {
		socket.on("chat:join", (roomId: string) => {
			if (roomId) socket.join(`chat:${roomId}`);
		});
		socket.on("notifications:subscribe", (userId: string) => {
			if (userId) socket.join(`user:${userId}`);
		});
	});

	return io;
}

