import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";

let io;

const defaultOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
];

export function userRoom(userId) {
    return `user:${userId}`;
}

export function initSocket(httpServer) {
    const allowedOrigins = [
        ...defaultOrigins,
        process.env.FRONTEND_URL,
        process.env.RENDER_EXTERNAL_URL,
    ].filter(Boolean);

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        }
    })

    io.use((socket, next) => {
        try {
            const rawCookie = socket.handshake.headers.cookie || "";
            const cookies = cookie.parse(rawCookie);
            const token = cookies.token;

            if (!token) {
                return next(new Error("Unauthorized"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch {
            next(new Error("Unauthorized"));
        }
    });

    console.log("Socket.io server is RUNNING")

    io.on("connection", (socket) => {
        socket.join(userRoom(socket.user.id));
        console.log(`Socket connected: ${socket.id} (user ${socket.user.id})`);
    });
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }

    return io
}
