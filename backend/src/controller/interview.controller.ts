import { Request, Response } from "express";
import mongoose from "mongoose";
import InterviewModel from "../models/interview.model.js";
import { generateInterviewQuestions } from "../services/gemini.services.js";
import { connectDB } from "../config/db.js";

async function checkDbConnection(res: Response): Promise<boolean> {
    if ((mongoose.connection.readyState as number) === 1) {
        return true;
    }
    await connectDB();
    if ((mongoose.connection.readyState as number) === 1) {
        return true;
    }
    res.status(503).json({
        success: false,
        message: "Database is not connected. Whitelist your current IP address in MongoDB Atlas Network Access.",
    });
    return false;
}
export type CreateInterviewInput = {
    role: string;
    level: string;
    techstack: string;
    type: string;
    amount: number;
}

export async function toInterviewJSON(doc: {
    _id: { toString: () => string };
    role: string;
    level: string;
    techstack?: string[];
    techStack?: string[];
    type: string;
    finalized?: boolean;
    questions: string[];
    coverImage?: string | null;
    createdAt?: Date | string;
}) {
    return {
        id: doc._id.toString(),
        role: doc.role,
        level: doc.level,
        techstack: doc.techstack ?? doc.techStack ?? [],
        type: doc.type,
        finalized: doc.finalized,
        questions: doc.questions,
        coverImage: doc.coverImage ?? undefined,
        createdAt: doc.createdAt
            ? (doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt))
            : new Date().toISOString(),
    };
}


export async function createInterview(req: Request, res: Response) {
    if (!(await checkDbConnection(res))) return;
    try {
        const { role, level, techstack, type, amount } = req.body;
        if (!role || !level || !techstack || !type || !amount) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: role, level, techstack, type, amount",
            });
        }
        const techstackArray = Array.isArray(techstack)
            ? techstack
            : typeof techstack === "string"
                ? techstack.split(",").map((tech) => tech.trim()).filter(Boolean)
                : [];

        const questions = await generateInterviewQuestions({ role, level, techstack, type, amount });// to be implemented . done ✅
        const interview = await InterviewModel.create({
            role,
            level,
            techstack: techstackArray,
            type,
            finalized: true,
            questions,
            coverImage: "https://images.unsplash.com/photo-1542401978-a9e4e6f02e71?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cmFuZG9tfGVufDB8fDB8fHww"
        });

        return res.status(201).json({
            success: true,
            message: "Interview created successfully",
            data: await toInterviewJSON(interview),
        })
    } catch (error) {
        console.error("Error creating interview:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create interview",
        });
    }


}

export async function getInterview(req: Request, res: Response) {
    if (!(await checkDbConnection(res))) return;
    try {
        const interview = await InterviewModel.findById(req.params.id).lean();
        if (!interview) {
            return res.status(404).json({ message: "Interview not found with this id", success: false })
        }
        return res.status(200).json({ success: true, data: await toInterviewJSON(interview) })
    } catch (error) {
        console.error("Error getting interview:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get interview",
        });
    }
}

export async function listInterview(_req: Request, res: Response) {
    if (!(await checkDbConnection(res))) return;
    try {
        const interviews = await InterviewModel.find().sort({ createdAt: -1 }).lean();
        return res.status(200).json({ success: true, data: await Promise.all(interviews.map(async (interview) => await toInterviewJSON(interview))) })
    } catch (error) {
        console.error("Error listing interviews:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to list interviews",
        });
    }
}

export async function updateInterview(req: Request, res: Response) {
    if (!(await checkDbConnection(res))) return;
    try {
        const data = req.body as Partial<CreateInterviewInput>
        const interview = await InterviewModel.findByIdAndUpdate(req.params.id, data, { new: true }).lean();
        if (!interview) {
            return res.status(404).json({ message: "Interview not found with this id", success: false })
        }
        return res.status(200).json({ success: true, data: await toInterviewJSON(interview) })
    } catch (error) {
        console.error("Error updating interview:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update interview",
        });
    }
}

export async function endInterview(req: Request, res: Response) {
    if (!(await checkDbConnection(res))) return;
    try {
        const interview = await InterviewModel.findById(req.params.id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found with this id", success: false })
        }
        interview.finalized = false;
        await interview.save();
        return res.status(200).json({ success: true, data: await toInterviewJSON(interview) })
    } catch (error) {
        console.error("Error ending interview:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to end interview",
        });
    }
}


