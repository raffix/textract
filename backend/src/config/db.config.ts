import mongoose from "mongoose";

const mongoUri: string = process.env.MONGO_URI || '';

export const connectDb = async (): Promise<void> => { 
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully!');
  } catch (err: any) {
    console.error('MongoDb connection error:', err);
    process.exit(1);
  }
}