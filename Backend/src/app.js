import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.route.js";
import morgan from "morgan";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "../public");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.FRONTEND_URL,
    process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.get("/api/health", (req, res) => {
    res.json({ message: "Server is running", ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

const hasFrontendBuild = fs.existsSync(path.join(publicDir, "index.html"));

if (hasFrontendBuild) {
    app.use(express.static(publicDir));

    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(publicDir, "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.json({
            message: "API is running. Build the frontend into Backend/public to serve the UI.",
        });
    });
}

export default app;
