import UserService from "../services/userService.js";
import uploadToCloudinary from '../utils/uploadToCloudinary.js';

class UserController {
    static async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const user = await UserService.getUserById(userId);

            res.json({
                message: "Profile retrieved successfully",
                user,
            });
        } catch (error) {
            if (error.message === "User not found") {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    }

    static async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const updates = req.body;

            const user = await UserService.updateUserProfile(userId, updates);

            res.json({
                message: "Profile updated successfully",
                user,
            });
        } catch (error) {
            if (error.message === "User not found") {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    }

    static async signup(req, res) {
        try {
            const {
                name, email, password, role, location,
                profession, experience, phone, bio, skills, aadhar
            } = req.body;

            let aadharImgUrl = null;
            let profilePicUrl = null;
            let introVideoUrl = null;
            let previousWorkUrls = [];

            if (role === 'worker' && req.files) {
                const { aadharImg, profilePic, previousWorkPics, introVideo } = req.files;

                if (aadharImg?.length) {
                    aadharImgUrl = await uploadToCloudinary(aadharImg[0], 'users/aadhar');
                }

                if (profilePic?.length) {
                    profilePicUrl = await uploadToCloudinary(profilePic[0], 'users/profile');
                }

                if (introVideo?.length) {
                    introVideoUrl = await uploadToCloudinary(introVideo[0], 'users/videos');
                }

                if (previousWorkPics?.length) {
                    previousWorkUrls = await Promise.all(
                        previousWorkPics.map(file =>
                            uploadToCloudinary(file, 'users/work')
                        )
                    );
                }
            }

            const user = await UserService.registerUser(
                name, email, password, role, location,
                profession, experience, phone, bio, skills, aadhar,
                { aadharImgUrl, profilePicUrl, introVideoUrl, previousWorkUrls }
            );

            const token = UserService.generateToken(user);
            const userResponse = UserService.formatUserResponse(user);

            res.status(201).json({
                message: "User registered successfully",
                token,
                user: userResponse,
                uploads: {
                    aadharImgUrl,
                    profilePicUrl,
                    introVideoUrl,
                    previousWorkUrls
                }
            });

        } catch (error) {
            console.error("Signup Error:", error);
            if (error.message === "User already exists") {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    }



    static async signin(req, res) {
        try {
            const { email, password } = req.body;

            const user = await UserService.authenticateUser(email, password);
            const token = UserService.generateToken(user);
            console.log("Backend Token", token);
            const userResponse = UserService.formatUserResponse(user);

            res.json({
                message: "Login successful",
                token,
                user: userResponse,
            });
        } catch (error) {
            if (error.message === "Invalid email or password") {
                return res.status(401).json({ message: error.message });
            }
            res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    }

}

export default UserController;
