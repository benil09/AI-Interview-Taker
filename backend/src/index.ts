import express from 'express';
import { connectDB } from './config/db.js';
import { seedInitialInterviews } from './config/seed.js';
import healthRoute from "./routes/health.routes.js";
import interviewRoute from "./routes/interview.routes.js";
import feedbackRoute from "./routes/feedback.routes.js";
import { PORT } from './config/env.js';
import cors from "cors"
const app = express();

// # All Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// # CORS Config
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));



// # ALL ROUTES
app.use("/api", healthRoute)
app.use("/api/interviews", interviewRoute)
app.use("/api/feedback", feedbackRoute)



app.listen(PORT, async () => {
  await connectDB();
  await seedInitialInterviews();
  console.log(`[Server]: Server is running on port ${PORT}`);
});


export default app;

