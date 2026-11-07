import { z } from "zod"



const interviewSchema = z.object({
        role:z.string().min(1),
        level:z.string(),
        techStack:z.array(z.string()).min(1),
        type:z.string(),
        amount:z.coerce.number().int().min(1).max(25),
        
})

const updateInterviewSchema = z.object({
    role:z.string().min(1),
    level:z.string(),
    techStack:z.array(z.string()).min(1),
})