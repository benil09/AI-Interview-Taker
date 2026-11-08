import { Request, Response } from "express";
import mongoose from "mongoose";
import { generateFeedbackFromTranscript } from "../services/gemini.services.js";
import Feedback from "../models/feedback.model.js";
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

export type CreateFeedbackInput = {
    interviewId: string;
    transcript: Array<{ role: string; content: string }>;
    feedbackId?: string;
}


export async function createFeedback(req: Request, res: Response): Promise<void> {
    if (!(await checkDbConnection(res))) return;
    try {
        const {interviewId , transcript , feedbackId} = req.body;

        if(!mongoose.Types.ObjectId.isValid(interviewId)){
            res.status(400).json({message: "Invalid interviewId"})
            return
        }

        const formattedTranscript = transcript.map((s: any) => `${s.role}:${s.content}`).join("\n")
        const aiFeedback = await generateFeedbackFromTranscript(formattedTranscript);

        const payload = {
            interviewId: new mongoose.Types.ObjectId(interviewId),
            totalScore: aiFeedback.totalScore,
            categoryScore: aiFeedback.categoryScore,
            strength: Array.isArray(aiFeedback.strength) ? aiFeedback.strength : [aiFeedback.strength],
            improvementAreas: aiFeedback.improvementAreas,
            recommendation: Array.isArray(aiFeedback.recommendation) ? aiFeedback.recommendation : [aiFeedback.recommendation],
        }

        let doc;

        if(feedbackId && mongoose.Types.ObjectId.isValid(feedbackId)) {
            doc = await Feedback.findByIdAndUpdate(feedbackId, payload, {new: true, upsert: false});
            if(!doc) {
                doc = await Feedback.create(payload);
            }
        }else{
            const existing = await Feedback.findOne({interviewId: payload.interviewId});
            if(existing) {
                doc = await Feedback.findByIdAndUpdate(existing._id, payload, {new: true});
            }else{
                doc = await Feedback.create(payload);
            }
        }

        res.status(200).json({success:true ,feedbackId: doc!._id.toString(), message: "Feedback created successfully", data: doc})
        
        


    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error while creating feedback"})
    }
}

export async function getFeedbackByInterview(req: Request, res: Response): Promise<void> {
    if (!(await checkDbConnection(res))) return;
    try {
        const interviewId = String(req.params.interviewId || req.params.id);
        if (!mongoose.Types.ObjectId.isValid(interviewId)) {
           res.status(400).json({ success: false, error: "Invalid interview id" });
           return;
        }
  
        const feedback = await Feedback.findOne({
            interviewId: new mongoose.Types.ObjectId(interviewId),
        }).lean();
  
        if (!feedback) {
        res.json({ success: true, data: null });
        return;
      }
      res.json({
        success: true,
        data: {
          id: feedback._id.toString(),
          interviewId: feedback.interviewId.toString(),
          totalScore: feedback.totalScore,
          categoryScores: feedback.categoryScore,
          strengths: feedback.strength,
          areasForImprovement: feedback.improvementAreas,
          finalAssessment:
            feedback.recommendation ??
            (feedback as { finalAssesment?: string }).finalAssesment,
          createdAt:
            feedback.createdAt instanceof Date
              ? feedback.createdAt.toISOString()
              : String(feedback.createdAt || new Date().toISOString()),
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Failed to fetch feedback" });
    }
}

