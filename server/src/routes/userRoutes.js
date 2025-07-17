import express from "express";
import UserController from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import multer from 'multer';
const storage = multer.memoryStorage(); // Use memory to get buffer
const upload = multer({ storage })

const router = express.Router();

// GET /api/profile - Get user profile
router.get("/profile", authenticateToken, UserController.getProfile);

// PUT /api/profile - Update user profile
router.put("/profile", authenticateToken, UserController.updateProfile);

// POST /api/signup - Register a new user
router.post(
  '/signup',
  upload.fields([
    { name: 'aadharImg', maxCount: 1 },
    { name: 'profilePic', maxCount: 1 },
    { name: 'previousWorkPics', maxCount: 10 },
    { name: 'introVideo', maxCount: 1 }
  ]),
  UserController.signup
);

// POST /api/signin - User login
router.post("/signin", UserController.signin);

export default router;
