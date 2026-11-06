import express, { Request, Response } from 'express';
import { connectDB } from './config/db.js';
import healthRoute from "./routes/health.routes.js";
import { PORT } from './config/env.js';

const app = express();

app.use(express.json());
app.use("/api",healthRoute)


app.get('/', (_req: Request, res: Response) => {
  res.send(`[Server]: AI Interview Taker API is running on PORT : ${PORT}`);
});

app.listen(PORT,async () => {
  await connectDB();
  console.log(`[Server]: Server is running on port ${PORT}`);
});


export default app;

