import express from "express";
import { getMessages, sendMessage } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getMessages);
router.post("/send", protectRoute, sendMessage); // protectRoute에 의해 

export default router;