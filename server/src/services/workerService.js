import User from "../models/User.js";

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
            .select("-password -ratings")
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

    static async rateWorker(workerId, clientId, rating, comment) {
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            throw new Error("Rating must be between 1 and 5");
        }

        // Find worker
        const worker = await User.findById(workerId);
        if (!worker || worker.role !== "worker") {
            throw new Error("Worker not found");
        }

        // Check if client already rated this worker
        const existingRatingIndex = worker.ratings.findIndex(
            (r) => r.clientId.toString() === clientId
        );

        if (existingRatingIndex !== -1) {
            // Update existing rating
            worker.ratings[existingRatingIndex] = {
                clientId,
                rating,
                comment: comment || "",
                createdAt: new Date(),
            };
        } else {
            // Add new rating
            worker.ratings.push({
                clientId,
                rating,
                comment: comment || "",
                createdAt: new Date(),
            });
        }

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
