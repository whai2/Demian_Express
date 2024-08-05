import express from "express";

import { getMessages, sendMessage, sendFile } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import { upload } from "../storage/connectS3.js";

const router = express.Router();

router.get("/", protectRoute, getMessages);
router.post("/send", protectRoute, sendMessage); // protectRoute에 의해 
router.post("/send/file", upload.single("file"), protectRoute, sendFile);

export default router;