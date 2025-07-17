import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

class AuthService {
    static async registerUser(userData) {
        const {
            name,
            email,
            password,
            role,
            profession,
            experience,
            hourlyRate,
            location,
            bio,
        } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("User already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user data object
        const newUserData = {
            name,
            email,
            password: hashedPassword,
            role,
        };

        // Add worker-specific fields if role is worker
        if (role === "worker") {
            newUserData.profession = profession;
            newUserData.experience = experience || 0;
            newUserData.hourlyRate = hourlyRate || 0;
            newUserData.location = location || "";
            newUserData.bio = bio || "";
        }

        const user = new User(newUserData);
        await user.save();

        return user;
    }

    static async loginUser(email, password) {
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Invalid credentials");
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        return user;
    }

    static generateToken(user) {
        return jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );
    }

    static formatUserResponse(user) {
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        if (user.role === "worker") {
            userResponse.profession = user.profession;
            userResponse.experience = user.experience;
            userResponse.hourlyRate = user.hourlyRate;
            userResponse.location = user.location;
            userResponse.bio = user.bio;
            userResponse.averageRating = user.averageRating;
            userResponse.totalRatings = user.totalRatings;
        }

        return userResponse;
    }
}

export default AuthService;
