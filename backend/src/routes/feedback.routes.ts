import { Router } from "express";
import { createFeedback, getFeedbackByInterview } from "../controller/feedback.controller.js";

const router = Router();

router.get("/:id",getFeedbackByInterview );
router.post("/",createFeedback )


export default router