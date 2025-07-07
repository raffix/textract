import express, { Request, Response } from 'express';
import { connectDb } from './config/db.config';

const app = express();
const port = process.env.PORT || 5000;

connectDb();

app.get("/health", (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend service is healthy'});
});

app.listen(port, () => {
  console.log(`Listening to the port ${port}`);
});
