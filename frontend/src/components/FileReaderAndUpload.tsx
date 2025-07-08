import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface FileReaderAndUploadProps { 
  onUploadSuccess: () => void;
  apiBaseUrl: string;
}

const FileReaderAndUpload: React.FC<FileReaderAndUploadProps> = ({ onUploadSuccess, apiBaseUrl}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incompatibleFilesMessage, setIncompatibleFilesMessage] = useState<string | null>(null)
  
  const isSupportedFile = (fileType: string): boolean => {
    return fileType.startsWith('text') ||
           fileType === 'application/json' ||
           fileType === 'application/xml';
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncompatibleFilesMessage(null);

    if(event.target.files) { 
      const incomingFiles = Array.from(event.target.files);

      const compatibleFiles: File[] = [];
      const incompatibleFileNames: string[] = [];

      incomingFiles.forEach((file) => {
        if(isSupportedFile(file.type)){
          compatibleFiles.push(file);
        }else {
          incompatibleFileNames.push(file.name);
        }
      });

      setSelectedFiles(compatibleFiles);
      
      if(incompatibleFileNames.length > 0) {
        const message = incompatibleFileNames.join(', ');
        setIncompatibleFilesMessage(`The following files aren't supported ${message}`);
      }
    } else {
      setSelectedFiles([]);
      setError(null);
    }
  }

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file"));
        }
      }
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setLoading(true);
    setError(null);
    setIncompatibleFilesMessage(null);

    const filesToUpload = [];
    try {
      for (const file of selectedFiles) {
        if (!isSupportedFile(file.type)) {
          throw new Error(`Internal error: file "${file.name}"`);
        }

        const plainTextContent = await readFileAsText(file);

        filesToUpload.push({
          content: plainTextContent,
          fileType: file.type,
          name: file.name,
        });
      }

      const response = await fetch(`${apiBaseUrl}/files/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: filesToUpload }),
      });

      if (!response.ok) {
        const errorDate = await response.json();
        throw new Error(`Upload filed: ${errorDate.message || response.statusText}`);
      }

      alert('Files uploaded successfully!');
      setSelectedFiles([]);
      onUploadSuccess();
    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred during upload.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(`Upload error: ${errorMessage}`);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ my: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUploadIcon />}
      >
        Select Text Files
        <input
          type="file"
          hidden
          multiple
          onChange={handleFileChange}
          accept="text/*, application/json, application/xml"
        />
      </Button>
      {selectedFiles.length > 0 && (
        <Typography variant="body2">
          Selected for upload: {selectedFiles.map(f => f.name).join(', ')}
        </Typography>
      )}
      {incompatibleFilesMessage && (
        <Typography variant="body2" color="error">
          {incompatibleFilesMessage}
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {loading ? 'Uploading...' : 'Upload Selected Text Files'}
      </Button>
      {error && (
        <Typography color="error" variant="body2">
          Error: {error}
        </Typography>
      )}
    </Box>
  );
};

export default FileReaderAndUpload;