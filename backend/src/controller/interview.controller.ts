import { Request, Response } from "express";
import InterviewModel from "../models/interview.model.js";
import { generateInterviewQuestions, } from "../services/gemini.services.js";
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
    createdAt: Date;
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
        createdAt: doc.createdAt.toISOString(),
    };
}


export async function createInterview(body: CreateInterviewInput, res: Response) {

    try {
        const { role, level, techstack, type, amount } = body;
        const questions = await generateInterviewQuestions({ role, level, techstack, type, amount });// to be implemented . done ✅
        const interview = await InterviewModel.create({
            role,
            level,
            techstack: techstack.split(',').map(tech => tech.trim()),
            type,
            finalized: true,
            questions,
            coverImage: generateRandomCoverImage(techstack) // to be implemented
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

export async function endInterview(req: Request, res: Response) {
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