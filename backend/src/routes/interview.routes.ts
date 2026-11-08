import {Router} from "express"
import { createInterview , endInterview, getInterview, listInterview, updateInterview } from "../controller/interview.controller.js"
const router = Router();

router.post("/", createInterview);
router.get("/:id", getInterview);
router.get("/", listInterview);
router.patch("/:id", updateInterview);
router.post("/:id/end", endInterview);

export default router;