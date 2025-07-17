import express from "express";
import AuthController from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", AuthController.register);

// POST /api/auth/login
router.post("/login", AuthController.login);

export default router;
