import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

const app = express();
const port = 5000; 
app.listen(port, () => {
  console.log('Listening to the port'+port);
})