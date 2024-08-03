import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectToMongoDB from "./src/db/connectToMongoDB.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`server Running on ${PORT}`);
});
