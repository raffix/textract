import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDb } from './config/db.config';
import fileRoutes from './routes/file.routes';

const app = express();
const port = process.env.PORT || 5000;

connectDb();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get("/health", (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend service is healthy'});
});

app.use('/api/files', fileRoutes);

app.listen(port, () => {
  console.log(`Listening to the port ${port}`);
});
