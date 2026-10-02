import { useCallback } from "react";
import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat } from "../service/chat.api";
import {
    setChats,
    setCurrentChatId,
    setError,
    setLoading,
    createNewChat,
    addNewMessage,
    addMessages,
    beginAiStream,
    appendAiStreamChunk,
    endAiStream,
} from "../chat.slice";
import { useDispatch, useStore } from "react-redux";

export const useChat = () => {

    const dispatch = useDispatch()
    const store = useStore()

    const connectSocket = useCallback(() => {
        return initializeSocketConnection({
            onStreamStart: ({ chatId, requestId, title, isNewChat, userMessage }) => {
                if (isNewChat && title) {
                    dispatch(createNewChat({ chatId, title }))
                    dispatch(addNewMessage({
                        chatId,
                        content: userMessage,
                        role: "user",
                    }))
                }
                dispatch(setCurrentChatId(chatId))
                dispatch(beginAiStream({ chatId, requestId }))
            },
            onStreamChunk: ({ chatId, requestId, delta }) => {
                dispatch(appendAiStreamChunk({ chatId, requestId, delta }))
            },
            onStreamEnd: ({ chatId, requestId }) => {
                dispatch(endAiStream({ chatId, requestId }))
                dispatch(setLoading(false))
            },
            onStreamError: ({ message }) => {
                dispatch(setError(message || "Failed to stream AI response"))
                dispatch(setLoading(false))
            },
        })
    }, [dispatch])

    async function handleSendMessage({ message, chatId }) {
        dispatch(setLoading(true))
        dispatch(setError(null))

        if (chatId) {
            dispatch(addNewMessage({
                chatId,
                content: message,
                role: "user",
            }))
        }

        try {
            const data = await sendMessage({ message, chatId })
            const { chat, aiMessage } = data
            const resolvedChatId = chatId || chat?._id

            if (!chatId && chat && !store.getState().chat.chats[chat._id]) {
                dispatch(createNewChat({
                    chatId: chat._id,
                    title: chat.title,
                }))
                dispatch(addNewMessage({
                    chatId: chat._id,
                    content: message,
                    role: "user",
                }))
            }

            dispatch(setCurrentChatId(resolvedChatId))

            const messages = store.getState().chat.chats[resolvedChatId]?.messages ?? []
            const streamedAi = messages.some(
                (msg) => msg.role === "ai" && msg.requestId === data.requestId
            )

            if (!streamedAi) {
                dispatch(addNewMessage({
                    chatId: resolvedChatId,
                    content: aiMessage.content,
                    role: aiMessage.role,
                }))
            }

            dispatch(setLoading(false))
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || error.message || "Failed to send message"))
            dispatch(setLoading(false))
        }
    }

    async function handleGetChats() {
        dispatch(setLoading(true))
        dispatch(setError(null))
        try {
            const data = await getChats()
            const { chats } = data
            dispatch(setChats(chats.reduce((acc, chat) => {
                acc[chat._id] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    lastUpdated: chat.updatedAt,
                }
                return acc
            }, {})))
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || error.message || "Failed to load chats"))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleOpenChat(chatId, chats) {
        dispatch(setCurrentChatId(chatId))

        const existingMessages = chats[chatId]?.messages
        if (!chatId || (existingMessages && existingMessages.length > 0)) {
            return
        }

        dispatch(setLoading(true))
        dispatch(setError(null))
        try {
            const data = await getMessages(chatId)
            const { messages } = data

            const formattedMessages = messages.map(msg => ({
                content: msg.content,
                role: msg.role,
            }))

            dispatch(addMessages({
                chatId,
                messages: formattedMessages,
            }))
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || error.message || "Failed to load messages"))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleDeleteChat(chatId) {
        try {
            await deleteChat(chatId)
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || error.message || "Failed to delete chat"))
        }
    }

    return {
        connectSocket,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat,
    }

}
