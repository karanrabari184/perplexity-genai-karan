import { io } from "socket.io-client";
import { getSocketUrl } from "../../../lib/apiBase.js";

let socket = null;

export function getChatSocket() {
    if (!socket) {
        socket = io(getSocketUrl(), {
            withCredentials: true,
        });
    }
    return socket;
}

/**
 * Socket.io drives live AI streaming; REST still saves messages and returns the final payload.
 */
export function initializeSocketConnection(handlers) {
    const s = getChatSocket();

    s.on("connect", () => {
        console.log("Connected to Socket.IO server");
    });

    s.off("chat:stream-start").on("chat:stream-start", handlers.onStreamStart);
    s.off("chat:stream-chunk").on("chat:stream-chunk", handlers.onStreamChunk);
    s.off("chat:stream-end").on("chat:stream-end", handlers.onStreamEnd);
    s.off("chat:stream-error").on("chat:stream-error", handlers.onStreamError);

    return () => {
        s.off("chat:stream-start", handlers.onStreamStart);
        s.off("chat:stream-chunk", handlers.onStreamChunk);
        s.off("chat:stream-end", handlers.onStreamEnd);
        s.off("chat:stream-error", handlers.onStreamError);
    };
}
