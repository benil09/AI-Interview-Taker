import mongoose, { InferSchemaType } from "mongoose"

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    feedback: {
        type: String,
        required: true
    }
}, {
    _id: false,
    timestamps: true
})

const feedbackSchema = new mongoose.Schema({
    feedbackId: String,
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
        required: true,
        index: true
    },

    totalScore: {
        type: Number,
        required: true
    }, 
    categoryScore: {
        type: [categorySchema],
        required: true
    },
    strength: {
        type: [String],
        required: true
    },
    improvementAreas: {
        type: [String],
        required: true
    },
    recommendation: {
        type: [String],
        required: true
    }

}, { timestamps: true })

export type FeedbackDocument = InferSchemaType<typeof feedbackSchema> & {
    _id: mongoose.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date
}
const Feedback = mongoose.model<FeedbackDocument>("Feedback", feedbackSchema)

export default Feedback