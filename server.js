import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectToMongoDB from "./src/db/connectToMongoDB.js";

import authRoutes from "./src/routes/auth.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import conversationRoutes from "./src/routes/conversation.routes.js";

import { app, server } from "./src/socket/socket.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    // origin: process.env.FRONTEND_URL,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`server Running on ${PORT}`);
});
