import crypto from "crypto";
import { generateResponseStream, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js";
import { getIO, userRoom } from "../sockets/server.socket.js";

export async function sendMessage(req, res) {

    const { message, chat: chatId } = req.body;

    if (!message?.trim()) {
        return res.status(400).json({ message: "Message is required" });
    }

    let title = null, chat = null;

    if (!chatId) {
        title = await generateChatTitle(message);
        chat = await chatModel.create({
            user: req.user.id,
            title
        })
    }

    const resolvedChatId = chatId || chat._id;
    const requestId = crypto.randomUUID();
    const io = getIO();
    const room = userRoom(req.user.id);

    await messageModel.create({
        chat: resolvedChatId,
        content: message,
        role: "user"
    })

    const messages = await messageModel.find({ chat: resolvedChatId })

    io.to(room).emit("chat:stream-start", {
        chatId: resolvedChatId,
        requestId,
        title: chat?.title ?? null,
        isNewChat: !chatId,
        userMessage: message,
    });

    try {
        const result = await generateResponseStream(messages, (delta) => {
            io.to(room).emit("chat:stream-chunk", {
                chatId: resolvedChatId,
                requestId,
                delta,
            });
        });

        const aiMessage = await messageModel.create({
            chat: resolvedChatId,
            content: result,
            role: "ai"
        })

        io.to(room).emit("chat:stream-end", {
            chatId: resolvedChatId,
            requestId,
            aiMessage,
        });

        res.status(201).json({
            title,
            chat,
            aiMessage,
            requestId,
        })
    } catch (error) {
        io.to(room).emit("chat:stream-error", {
            chatId: resolvedChatId,
            requestId,
            message: error.message || "Failed to generate response",
        });

        res.status(500).json({
            message: error.message || "Failed to generate response",
        });
    }

}

export async function getChats(req, res) {
    const user = req.user

    const chats = await chatModel.find({ user: user.id })

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    })
}

export async function getMessages(req, res) {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    const messages = await messageModel.find({
        chat: chatId
    })

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages
    })
}

export async function deleteChat(req, res) {

    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    await messageModel.deleteMany({
        chat: chatId
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    res.status(200).json({
        message: "Chat deleted successfully"
    })
}
