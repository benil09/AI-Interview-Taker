import { Request, Response } from "express";
import express from "express"

const router = express.Router();

router.get("/health", (_req: Request, res: Response) => {
    res.status(200).send({ message: "[Health Route]: API is working fine", time: new Date().toISOString() });
});

export default router;  