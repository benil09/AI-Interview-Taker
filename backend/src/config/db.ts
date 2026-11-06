import mongoose from "mongoose";
import { MONGO_URI } from "./env.js";


export async function connectDB(): Promise<void>{
    await mongoose.connect(MONGO_URI)
    .catch((error:Error)=>{
        console.log("[Database]: MongoDB connection failed",error);
        process.exit(1);
    })
    console.log("[Database]: MongoDB Connected");
}