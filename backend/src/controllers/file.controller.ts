import { Request, Response } from "express";
import * as fileService from '../services/file.service';

interface IFilePayload {
  content: string;
  fileType: string;
  name: string;
}

export const uploadFiles = async (req: Request, res: Response): Promise<void> => {
  const filesToProcess: IFilePayload[] = req.body.files;

  if (!filesToProcess || filesToProcess.length === 0) {
    res.status(400).send('No files to upload');
    return;
  }

  try {
    const filesData = filesToProcess.map(file => ({
      content: file.content,
      fileType: file.fileType,
      name: file.name,
      uploadDate: new Date(),
    }));

    const createdFiles = await fileService.createFilesRecord(filesData);

    const responseFiles = createdFiles.map(file => {
      const { content, ...rest } = file.toObject();
      return rest;
    });

    res.status(200).json({ message: 'Files content saved!', files: responseFiles });

  } catch (err: unknown) {
    let errorMessage = 'An unexpected error occurred during file content upload.';
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    console.error('Error during file content upload:', err);
    res.status(500).send(`Server error during file content upload: ${errorMessage}`);
  }
}

export const getAllFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = await fileService.getAllFiles();
    res.status(200).json(files);
  } catch (err: unknown) {
    let errorMessage = 'An unexpected error occurred while fetching files.';
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    console.error('Error fetching files:', err);
    res.status(500).send(`Server error: ${errorMessage}`);
  }
};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  const fileId = req.params.id;

  try {
    const deletedFile = await fileService.deleteFileById(fileId);
    if (!deletedFile) {
      res.status(404).send('File not found');
      return;
    }
    res.status(200).json({ message: 'File deleted successfully!', deletedFileId: fileId });
  } catch (err: unknown) {
    let errorMessage = 'An unexpected error during file deletion.';
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    console.error(`Error deleting file ${fileId}:`, err);
    res.status(500).send(`Server error deleting file: ${errorMessage}`);
  }
}

export const getFile = async (req: Request, res: Response): Promise<void> => {
  const fileId = req.params.id;

  try {
    const file = await fileService.getFileById(fileId);
    if (!file) {
      res.status(404).send('File not found');
      return;
    }
    res.status(200).json(file);
  } catch (err: unknown) {
    let errorMessage = 'An unexpected error during file find.';
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    console.error(`Error finding file ${fileId}:`, err);
    res.status(500).send(`Server error finding file: ${errorMessage}`);
  }
}

export const getFiles = async (req: Request, res: Response): Promise<void> => {
  const searchTerm = req.params.search;

  try {
    const files = await fileService.getFilesByContent(searchTerm);
    res.status(200).json(files);
  } catch (err: unknown) {
    let errorMessage = 'An unexpected error during file find.';
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    console.error(`Error finding by search term ${searchTerm}:`, err);
    res.status(500).send(`Server error finding file: ${errorMessage}`);
  }
}
