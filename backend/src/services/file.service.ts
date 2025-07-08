import { File, IFile } from '../models/file.model';

export const createFilesRecord = async (filesData: Partial<IFile>[]): Promise<IFile[]> => {
  const createdFiles: IFile[] = [];
  for (const fileData of filesData) {
    const newFile =  new File(fileData);
    await newFile.save();
    createdFiles.push(newFile);
  }

  return createdFiles;
};

export const getAllFiles = async (): Promise<IFile[]> => {
  return File.find({}).select('-content').lean();
}

export const getFilesByContent = async (content: string): Promise<IFile[] | null> => {
  return await File.find({ content: { $regex: content, $options: 'i'}});
}