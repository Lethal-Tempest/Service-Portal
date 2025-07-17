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
        firstName, lastName, name, email, password, role, location,
        profession, experience, phone, bio, skills, aadhar,
        uploads // contains cloudinary URLs
    ) {
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new Error("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);

        if(name===null){
            name = firstName + " " + lastName;
        }

        const newUser = new User({
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
            aadharImg: uploads.aadharImgUrl,
            profilePic: uploads.profilePicUrl,
            introVideo: uploads.introVideoUrl,
            previousWorkPics: uploads.previousWorkUrls
        });

        await newUser.save();
        return newUser;
    }


    static generateToken(user) {
        return jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "7d" }
        );
    }

    static formatUserResponse(user) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            location: user.location,
        };
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
