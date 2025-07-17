import WorkerService from "../services/workerService.js";

class WorkerController {
    static async getWorkers(req, res) {
        try {
            const filters = req.query;
            const workers = await WorkerService.getWorkers(filters);

            res.json({
                message: "Workers retrieved successfully",
                workers,
            });
        } catch (error) {
            res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    }

    static async getWorkerById(req, res) {
        try {
            const workerId = req.params.id;
            const worker = await WorkerService.getWorkerById(workerId);

            res.json({
                message: "Worker details retrieved successfully",
                worker,
            });
        } catch (error) {
            if (error.message === "Worker not found") {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    }

    static async rateWorker(req, res) {
        try {
            const { rating, comment } = req.body;
            const workerId = req.params.id;
            const clientId = req.user.userId;

            const result = await WorkerService.rateWorker(
                workerId,
                clientId,
                rating,
                comment
            );

            res.json({
                message: "Rating submitted successfully",
                ...result,
            });
        } catch (error) {
            if (
                error.message === "Rating must be between 1 and 5" ||
                error.message === "Worker not found"
            ) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    }

    static async updateAvailability(req, res) {
        try {
            const { isAvailable } = req.body;
            const userId = req.user.userId;

            const availability = await WorkerService.updateAvailability(
                userId,
                isAvailable
            );

            res.json({
                message: "Availability updated successfully",
                isAvailable: availability,
            });
        } catch (error) {
            res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    }

    static async getWorkerRatings(req, res) {
        try {
            const workerId = req.params.id;
            const ratings = await WorkerService.getWorkerRatings(workerId);

            res.json({
                message: "Ratings retrieved successfully",
                ratings,
            });
        } catch (error) {
            if (error.message === "Worker not found") {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({
                message: "Server error",
                error: error.message,
            });
        }
    }
}

export default WorkerController;
