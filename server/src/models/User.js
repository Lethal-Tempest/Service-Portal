import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["client", "worker"],
            required: true,
        },
        // Worker-specific fields
        profession: {
            type: String,
            enum: [
                "carpenter",
                "plumber",
                "electrician",
                "painter",
                "mechanic",
                "other",
            ],
            required: function () {
                return this.role === "worker";
            },
        },
        experience: {
            type: Number, // years of experience
            default: 0,
        },
        hourlyRate: {
            type: Number,
            default: 0,
        },
        location: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        skills:{
            type: [String],
            default: [],
        },
        ratings: [
            {
                clientId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                rating: {
                    type: Number,
                    min: 1,
                    max: 5,
                    required: true,
                },
                comment: {
                    type: String,
                    default: "",
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        averageRating: {
            type: Number,
            default: 0,
        },
        totalRatings: {
            type: Number,
            default: 0,
        },
        aadhar: { type: String },
        aadharImgUrl: { type: String },
        profilePicUrl: { type: String },
        introVideoUrl: { type: String, default: null },
        previousWorkUrls: { type: [String], default: [] },

    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", function (next) {
    if (this.role === "worker" && this.ratings.length > 0) {
        const sum = this.ratings.reduce(
            (acc, rating) => acc + rating.rating,
            0
        );
        this.averageRating = sum / this.ratings.length;
        this.totalRatings = this.ratings.length;
    }
    next();
});

export default mongoose.model("User", userSchema);
