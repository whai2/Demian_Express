import express from "express";
import { login, logout, signup, deleteAccount } from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.delete("/", protectRoute, deleteAccount);

export default router; 
