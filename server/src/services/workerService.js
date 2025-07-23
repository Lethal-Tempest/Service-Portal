import User from "../models/User.js";
import mongoose from "mongoose";

class WorkerService {
    static async getWorkers(filters = {}) {
        const {
            profession,
            location,
            minRating,
            sortBy = "averageRating",
            order = "desc",
        } = filters;

        let query = { role: "worker" };

        // Add filters
        if (profession) query.profession = profession;
        if (location) query.location = { $regex: location, $options: "i" };
        if (minRating) query.averageRating = { $gte: parseFloat(minRating) };

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = order === "desc" ? -1 : 1;

        const workers = await User.find(query)
            .select("-password")
            .sort(sortOptions);

        return workers;
    }

    static async getWorkerById(workerId) {
        const worker = await User.findById(workerId)
            .select("-password")
            .populate("ratings.clientId", "name");

        if (!worker || worker.role !== "worker") {
            throw new Error("Worker not found");
        }

        return worker;
    }

    static async rateWorker(workerId, clientId, rating, comment = "", isAnon, uploads={}) {

        if (!uploads) {
            console.log("🚨 uploads is undefined! Defaulting to empty object.");
            uploads = {};
        }

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            throw new Error("Rating must be between 1 and 5");
        }

        // Find worker
        const worker = await User.findById(workerId);
        if (!worker || worker.role !== "worker") {
            throw new Error("Worker not found");
        }

        // Ensure clientId is an ObjectId
        const clientObjectId = new mongoose.Types.ObjectId(clientId);

        // Check if the client has already rated
        const existingIndex = worker.ratings.findIndex(
            (r) => r.clientId.toString() === clientObjectId.toString()
        );

        if (existingIndex !== -1) {
            // Update existing rating
            worker.ratings[existingIndex].rating = rating;
            worker.ratings[existingIndex].comment = comment;
            worker.ratings[existingIndex].isAnon = isAnon;
            worker.ratings[existingIndex].reviewImgUrl = uploads.reviewImgUrl;
            worker.ratings[existingIndex].createdAt = new Date();
        } else {
            // Add new rating
            worker.ratings.push({
                clientId: clientObjectId,
                isAnon,
                rating,
                comment,
                reviewImgUrl: uploads.reviewImgUrl,
                createdAt: new Date(),
            });
        }

        // Recalculate averageRating and totalRatings
        const total = worker.ratings.reduce((acc, r) => acc + r.rating, 0);
        worker.totalRatings = worker.ratings.length;
        worker.averageRating = total / worker.totalRatings;

        await worker.save();

        return {
            averageRating: worker.averageRating,
            totalRatings: worker.totalRatings,
        };
    }

    static async updateAvailability(workerId, isAvailable) {
        const worker = await User.findByIdAndUpdate(
            workerId,
            { isAvailable },
            { new: true }
        ).select("-password");

        if (!worker) {
            throw new Error("Worker not found");
        }

        return worker.isAvailable;
    }

    static async getWorkerRatings(workerId) {
        const worker = await User.findById(workerId)
            .select("ratings")
            .populate("ratings.clientId", "name");

        if (!worker || worker.role !== "worker") {
            throw new Error("Worker not found");
        }

        return worker.ratings.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
}

export default WorkerService;
