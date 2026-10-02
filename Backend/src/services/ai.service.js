import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "langchain";

const geminiModel = new ChatGoogleGenerativeAI({
        model: "gemini-3.5-flash-lite",
    apiKey: process.env.GEMINI_API_KEY || ""
});

export async function generateResponse(messages) {
    console.log("Generating AI response for messages:", messages)

    if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set in environment variables");
        throw new Error("GEMINI_API_KEY is not configured");
    }

    try {
        const response = await geminiModel.invoke([
            new SystemMessage(`
                You are a helpful and precise assistant for answering questions.
                If you don't know the answer, say you don't know. 
                Provide clear, concise, and accurate responses.
            `),
            ...(messages.map(msg => {
                if (msg.role == "user") {
                    return new HumanMessage(msg.content)
                } else if (msg.role == "ai") {
                    return new AIMessage(msg.content)
                }
            }))
        ]);

        console.log("AI response received:", response.text);
        return response.text;
    } catch (error) {
        console.error("Error generating AI response:", error);
        throw error;
    }
}

/** Streams tokens to the client via Socket.io while Gemini generates the reply. */
export async function generateResponseStream(messages, onChunk) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const stream = await geminiModel.stream([
        new SystemMessage(`
            You are a helpful and precise assistant for answering questions.
            If you don't know the answer, say you don't know. 
            Provide clear, concise, and accurate responses.
        `),
        ...(messages.map(msg => {
            if (msg.role == "user") {
                return new HumanMessage(msg.content)
            } else if (msg.role == "ai") {
                return new AIMessage(msg.content)
            }
        }))
    ]);

    let fullText = "";

    for await (const chunk of stream) {
        const delta = typeof chunk.content === "string" ? chunk.content : "";
        if (!delta) continue;
        fullText += delta;
        onChunk(delta);
    }

    return fullText;
}

export async function generateChatTitle(message) {
    if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set in environment variables");
        throw new Error("GEMINI_API_KEY is not configured");
    }

    try {
        const response = await geminiModel.invoke([
            new SystemMessage(`
                You are a helpful assistant that generates concise and descriptive titles for chat conversations.
                
                User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
            `),
            new HumanMessage(`
                Generate a title for a chat conversation based on the following first message:
                "${message}"
                `)
        ])

        return response.text;
    } catch (error) {
        console.error("Error generating chat title:", error);
        throw error;
    }
}
