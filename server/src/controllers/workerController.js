import WorkerService from "../services/workerService.js";
import jwt from 'jsonwebtoken';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';

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
            const token = req.headers.authorization.split(' ')[1];
            const { id: workerId } = await jwt.verify(
                token,
                process.env.JWT_SECRET
            );
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
            const { workerId, rating, comment, isAnon } = req.body;

            let uploads = {
                reviewPicUrl: null,
            };

            let reviewPic;
            if (req.files) {
                ({ reviewPic } = req.files); // Use destructuring assignment properly
            }

            uploads.reviewPicUrl = reviewPic?.[0]
                ? await uploadToCloudinary(reviewPic[0], 'workers/reviews')
                : null;

            const clientId = req.user._id; // Assuming you're using auth middleware

            const result = await WorkerService.rateWorker(workerId, clientId, rating, comment, isAnon, uploads);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
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
