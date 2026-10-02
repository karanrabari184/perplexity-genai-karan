import { createSlice } from '@reduxjs/toolkit';


const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload
            state.chats[ chatId ] = {
                id: chatId,
                title,
                messages: [],
                lastUpdated: new Date().toISOString(),
            }
        },
        addNewMessage: (state, action) => {
            const { chatId, content, role, streaming, requestId } = action.payload
            if (!state.chats[chatId]) {
                state.chats[chatId] = {
                    id: chatId,
                    title: "New chat",
                    messages: [],
                    lastUpdated: new Date().toISOString(),
                }
            }
            state.chats[chatId].messages.push({
                content,
                role,
                streaming: streaming ?? false,
                requestId: requestId ?? null,
            })
        },
        beginAiStream: (state, action) => {
            const { chatId, requestId } = action.payload
            if (!state.chats[chatId]) return
            state.chats[chatId].messages.push({
                content: "",
                role: "ai",
                streaming: true,
                requestId,
            })
        },
        appendAiStreamChunk: (state, action) => {
            const { chatId, requestId, delta } = action.payload
            const chat = state.chats[chatId]
            if (!chat) return

            const streamMessage = chat.messages.find(
                (msg) => msg.role === "ai" && msg.streaming && msg.requestId === requestId
            )

            if (streamMessage) {
                streamMessage.content += delta
            }
        },
        endAiStream: (state, action) => {
            const { chatId, requestId } = action.payload
            const chat = state.chats[chatId]
            if (!chat) return

            const streamMessage = chat.messages.find(
                (msg) => msg.role === "ai" && msg.streaming && msg.requestId === requestId
            )

            if (streamMessage) {
                streamMessage.streaming = false
            }
        },
        addMessages: (state, action) => {
            const { chatId, messages } = action.payload
            if (!state.chats[chatId]) return
            state.chats[chatId].messages.push(...messages)
        },
        setChats: (state, action) => {
            state.chats = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    }
})

export const {
    setChats,
    setCurrentChatId,
    setLoading,
    setError,
    createNewChat,
    addNewMessage,
    addMessages,
    beginAiStream,
    appendAiStreamChunk,
    endAiStream,
} = chatSlice.actions
export default chatSlice.reducer


// chats = {
//     "docker and AWS": {
//         messages: [
//             {
//                 role: "user",
//                 content: "What is docker?"
//             },
//             {
//                 role: "ai",
//                 content: "Docker is a platform that allows developers to automate the deployment of applications inside lightweight, portable containers. It provides an efficient way to package and distribute software, ensuring consistency across different environments."
//             }
//         ],
//         id: "docker and AWS",
//         lastUpdated: "2024-06-20T12:34:56Z",
//     }

// }
