import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

class UserService {
    static async getUserById(userId) {
        const user = await User.findById(userId).select("-password");
        if (!user) throw new Error("User not found");
        return user;
    }

    static async updateUserProfile(userId, updates) {
        delete updates.password;
        delete updates.role;
        delete updates.ratings;
        delete updates.averageRating;
        delete updates.totalRatings;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) throw new Error("User not found");
        return user;
    }

    static async registerUser(
        name, email, password, role, location,
        profession, experience, phone, bio, skills, aadhar, hourlyRate,
        uploads = {} // default fallback
    ) {
        if (!uploads) {
            console.log("🚨 uploads is undefined! Defaulting to empty object.");
            uploads = {};
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            name,
            email,
            password: hashedPassword,
            role,
            location,
            profession,
            experience,
            phone,
            bio,
            skills,
            aadhar,
            hourlyRate,
            aadharImgUrl: uploads.aadharImgUrl || null,
            profilePicUrl: uploads.profilePicUrl || null,
            introVideoUrl: uploads.introVideoUrl || null,
            previousWorkUrls: uploads.previousWorkUrls || [],
        };

        const user = new User(userData);
        await user.save();

        return user;
    }

    static async authenticateUser(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }

        return user;
    }


}

export default UserService;
