import express from 'express';
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.get('/', (req, res) => {
    res.send('AI Interview Taker API is running');
});
export default app;
