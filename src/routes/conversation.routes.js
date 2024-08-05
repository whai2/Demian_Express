import express from "express";

import { getConversationList, makeNew } from "../controllers/conversation.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import { upload } from "../storage/connectS3.js";

const router = express.Router();

router.get("/", protectRoute, getConversationList);
router.post("/", upload.single("file"), makeNew);

export default router;