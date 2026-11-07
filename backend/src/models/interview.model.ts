import mongoose, { type InferSchemaType } from "mongoose";


const interviewSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    techstack: {
        type: [String],
        required: true,
    },
    questions: {
        type: [String],
        required: true
    },
    finalized: {
        type: Boolean,
        default: false
    },
    coverImage: {
        type: String,

    },
}, { timestamps: true })


export type InterviewDocument = InferSchemaType<typeof interviewSchema> & {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}


const InterviewModel = mongoose.model<InterviewDocument>("Interview", interviewSchema)
export default InterviewModel;