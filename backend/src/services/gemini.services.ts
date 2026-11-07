import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { GEMINI_API_KEY, GEMINI_LLM_MODEL } from "../config/env.js";
import { FeedbackAI, feedbackSchema } from "../dtos/feedback.dtos.js";

const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

export interface GenerateQuestionsInput {
    role: string;
    level: string;
    techstack: string;
    type: string;
    amount: number;
}

export async function generateInterviewQuestions(input: GenerateQuestionsInput): Promise<string[]> {
    const { role, level, techstack, type, amount } = input;

    const prompt = await ai.interactions.create({
        model: GEMINI_LLM_MODEL,
        input: `
        Generate exactly ${amount} interview questions for this position.

        Role: ${role}
        Experience level: ${level}
        Tech stack: ${techstack}
        Preferred focus: ${type}

        Requirements:
        - Create questions that are realistic, specific, and valuable for assessing this exact role and experience level.
        - Base technical questions on the listed tech stack. Mention a technology only when it is genuinely relevant to the question.
        - Test practical engineering judgment, debugging, tradeoffs, architecture, performance, security, testing, deployment, and maintainability where appropriate for the stack and level.
        - Adapt difficulty to the experience level:
            - Junior: fundamentals, implementation choices, debugging, and clear reasoning.
            - Mid level: production scenarios, tradeoffs, collaboration, and ownership.
            - Senior: system design, architecture, scalability, reliability, security, leadership, and technical decision making.
        - For behavioural questions, use realistic situations relevant to the role and ask for concrete examples.
        - Follow the requested focus. If the focus is technical, most questions must be technical. If behavioural, most must be behavioural. If balanced, use an even mix.
        - Avoid generic questions such as "What is ${techstack}?" or "Tell me about yourself."
        - Do not repeat topics or ask near-duplicate questions.
        - Each question must be understandable when read aloud by a voice assistant.
        - Do not use markdown, numbering, bullet points, slash characters, asterisks, or unnecessary symbols.
        - Return only a valid JSON array of exactly ${amount} double quoted question strings.`,
    });

    const raw = prompt.output_text?.trim();
    if (!raw) {
        throw new Error("No response from Gemini");
    }

    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed: unknown;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error("Gemini returned malformed JSON");
    }

    if (
        !Array.isArray(parsed) ||
        !parsed.every((question): question is string => typeof question === "string")
    ) {
        throw new Error("Gemini returned an invalid questions format");
    }

    const questions: string[] = parsed;
    return questions;
}

export async function generateFeedbackFromTranscript(formattedTranscript: string): Promise<FeedbackAI> {
    const response = await ai.models.generateContent({
        model: GEMINI_LLM_MODEL,
        contents: `
You are an AI interviewer analysing a mock interview.

Score the candidate from 0 to 100 in each provided category.
Do not add categories that are not listed.

Transcript: ${formattedTranscript}

Categories:
- Communication Skills: Clarity, articulation, and structured responses
- Technical Knowledge: Understanding of key concepts for the role
- Problem Solving: Breaking down complex problems and proposing solutions
- Cultural Fit: How well the candidate fits the company culture
- Confidence and Clarity: How confident and clear the candidate is
`,
        config: {
            systemInstruction: `
You are a professional interviewer analysing a mock interview.
Be thorough, detailed, and constructive.
Do not be lenient. Clearly identify mistakes and areas for improvement.
`,
            responseMimeType: "application/json",
            responseJsonSchema: z.toJSONSchema(feedbackSchema),
        },
    });

    const raw = response.text?.trim();
    if (!raw) {
        throw new Error("Gemini returned empty feedback");
    }

    let data: unknown;
    try {
        data = JSON.parse(raw);
    } catch {
        throw new Error("Gemini returned malformed feedback JSON");
    }

    try {
        return feedbackSchema.parse(data);
    } catch {
        throw new Error("Gemini returned invalid feedback format");
    }
}
