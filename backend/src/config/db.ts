import mongoose from "mongoose";
import { MONGO_URI } from "./env.js";

let isConnecting = false;

export async function connectDB(): Promise<void> {
    if ((mongoose.connection.readyState as number) === 1 || isConnecting) {
        return;
    }
    isConnecting = true;
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("[Database]: MongoDB Connected");
    } catch (error: any) {
        console.error("[Database]: MongoDB connection failed:", error.message || error);
        console.warn("[Database]: Whitelist your current IP (e.g. 117.233.167.71 or 0.0.0.0/0) in MongoDB Atlas -> Security -> Network Access.");
    } finally {
        isConnecting = false;
    }
}