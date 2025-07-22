import express from "express";
import WorkerController from "../controllers/workerController.js";
import {
    authenticateToken,
    requireRole,
} from "../middleware/authMiddleware.js";
import multer from 'multer';
const storage = multer.memoryStorage(); // Use memory to get buffer
const upload = multer({ storage })

const router = express.Router();

// GET /api/workers - Get all workers (clients only)
router.get(
    "/",
    authenticateToken,
    // requireRole(["client"]),
    WorkerController.getWorkers
);

// GET /api/workers/:id - Get worker details
router.get("/:id", authenticateToken, WorkerController.getWorkerById);

// POST /api/workers/:id/rate - Rate a worker (clients only)
router.post(
    "/:id/rate",
    upload.fields([
        { name: 'reviewPic', maxCount: 1 },
    ]),
    authenticateToken,
    // requireRole(["client"]),
    WorkerController.rateWorker
);

// GET /api/workers/:id/ratings - Get worker ratings
router.get(
    "/:id/ratings",
    authenticateToken,
    WorkerController.getWorkerRatings
);

// PATCH /api/workers/availability - Update worker availability (workers only)
router.patch(
    "/availability",
    authenticateToken,
    requireRole(["worker"]),
    WorkerController.updateAvailability
);

export default router;
