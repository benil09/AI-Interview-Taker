import { z } from "zod"



export const interviewSchema = z.object({
        role:z.string().min(1),
        level:z.string(),
        techStack:z.array(z.string()).min(1),
        type:z.string(),
        amount:z.coerce.number().int().min(1).max(25),
        
})

export const updateInterviewSchema = z.object({
    role:z.string().min(1),
    level:z.string(),
    techStack:z.array(z.string()).min(1),
})

export type CreateInterviewDTO = z.infer<typeof interviewSchema>;
export type UpdateInterviewDTO = z.infer<typeof updateInterviewSchema>;
