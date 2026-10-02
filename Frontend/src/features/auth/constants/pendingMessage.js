export const PENDING_CHAT_MESSAGE_KEY = "perplexity_pending_chat_message"

export function savePendingChatMessage(message) {
    if (message?.trim()) {
        sessionStorage.setItem(PENDING_CHAT_MESSAGE_KEY, message.trim())
    }
}

export function consumePendingChatMessage() {
    const message = sessionStorage.getItem(PENDING_CHAT_MESSAGE_KEY)
    if (message) {
        sessionStorage.removeItem(PENDING_CHAT_MESSAGE_KEY)
    }
    return message || ""
}
