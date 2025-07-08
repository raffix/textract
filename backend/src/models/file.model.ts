import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  content: string;
  fileType: string;
  name: string;
  uploadDate: Date;
}

const FileSchema: Schema = new Schema({
  content: { type: String, required: true },
  fileType: { type: String, required: true },
  name: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

export const File = mongoose.model<IFile>('File', FileSchema);