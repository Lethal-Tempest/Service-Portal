import UserService from "../services/userService.js";
import uploadToCloudinary from '../utils/uploadToCloudinary.js';
import { generateToken, formatUserResponse } from '../utils/auth.js';

class UserController {
    static async getProfile(req, res) {
        try {
            if (!req.user?.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

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
            if (!req.user?.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

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
            // console.log(req);

            const {
                name, email, password, role, location,
                profession, experience, phone, bio, skills, aadhar, hourlyRate
            } = req.body;


            // console.log("req incoming: ", req.body);

            let uploads = {
                aadharImgUrl: null,
                profilePicUrl: null,
                introVideoUrl: null,
                previousWorkUrls: []
            };

            if (role === 'worker' && req.files) {
                const { aadharImg, profilePic, previousWorkPics, introVideo } = req.files;

                uploads.aadharImgUrl = aadharImg?.[0]
                    ? await uploadToCloudinary(aadharImg[0], 'users/aadhar')
                    : null;

                uploads.profilePicUrl = profilePic?.[0]
                    ? await uploadToCloudinary(profilePic[0], 'users/profile')
                    : null;

                uploads.introVideoUrl = introVideo?.[0]
                    ? await uploadToCloudinary(introVideo[0], 'users/videos')
                    : null;

                uploads.previousWorkUrls = previousWorkPics?.length
                    ? await Promise.all(previousWorkPics.map(file =>
                        uploadToCloudinary(file, 'users/work')))
                    : [];
            }

            const user = await UserService.registerUser(
                name, email, password, role, location,
                profession, experience, phone, bio, skills, aadhar,
                hourlyRate,
                uploads
            );


            const token = generateToken(user);
            const userResponse = formatUserResponse(user);

            console.log("Reponse incoming: ", userResponse);


            res.status(201).json({
                message: "User registered successfully",
                token,
                user: userResponse,
                uploads
            });

        } catch (error) {
            console.log("Error coming abc", error);
            if (error.message === "User already exists") {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({
                message: "Server error X",
                error: error.message,
            });
        }
    }





    static async signin(req, res) {
        try {
            const { email, password } = req.body;

            const user = await UserService.authenticateUser(email, password);
            const token = generateToken(user);
            console.log("Backend Token", token);
            const userResponse = formatUserResponse(user);

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
