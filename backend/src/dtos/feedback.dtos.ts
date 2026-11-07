import {z} from "zod";

const categorySchema = z.object({
    name:z.string().min(1),
    score:z.number().int().min(1).max(10),
    feedback:z.string().min(1),
})

const feedbackSchema = z.object({
    feedbackId:z.string().min(1),
    interviewId:z.string().min(1),
    totalScore:z.number(),
    categoryScore:z.array(categorySchema),
    strength:z.string().min(1),
    improvementAreas:z.array(z.string().min(1)),
    recommendation:z.string().min(1)
})

export type FeedbackAI = z.infer<typeof feedbackSchema>;
export {feedbackSchema,categorySchema};