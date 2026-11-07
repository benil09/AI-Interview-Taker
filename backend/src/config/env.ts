import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
    const value = process.env[name]
    if(!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value;
}


export const PORT = process.env.PORT || 3000;
export const MONGO_URI = process.env.MONGO_URI || "";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
export const GEMINI_LLM_MODEL = process.env.GEMINI_LLM_MODEL || "gemini-3.5-flash-lite";
export const VIBE_API_KEY = process.env.VIBE_API_KEY || "";

