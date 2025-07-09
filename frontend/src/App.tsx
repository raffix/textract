import { useCallback, useState } from 'react';
import { Typography, Container, Box, Grid, Button } from '@mui/material';

import FileReaderAndUpload from './components/FileReaderAndUpload';
import FileSearchAndList, { type FileMetadata } from './components/FileSearchAndList';
import { useToast } from './contexts/ToastContext';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [errorFiles, setErrorFiles] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);

  const { showToast } = useToast();

  const fetchFiles = useCallback(async (searchTerm?: string | null) => {
    setLoadingFiles(true);
    setErrorFiles(null);
    try {
      let url = `${API_BASE_URL}/files`;
      if (searchTerm && searchTerm.length > 0) {
        url += `/${searchTerm}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: FileMetadata[] = await response.json();
      setFiles(data);
    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred while fetching files.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setErrorFiles(`Failed to fetch files: ${errorMessage}`);
      console.error('Failed to fetch files:', err);
      showToast(`Failed to load files: ${errorMessage}`, 'error');
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  const handleViewContent = useCallback(async (fileId: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${fileId}/content`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Content of ${name}:\n\n${data.content}`);
      setSelectedFile(data);
      setSelectedFileContent(data.content);
    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred during content retrieval.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      throw new Error(errorMessage);
    }
  }, []);

  const handleDeleteFile = useCallback(async (fileId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Deletion failed: ${errorData.message || response.statusText}`);
      }
      showToast('File deleted successfully!', 'success');
      fetchFiles();
    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred during deletion.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      console.error('Error deleting file:', err);
      throw new Error(errorMessage);
    }
  }, [fetchFiles]);

  return (
    <Container maxWidth="lg">
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Textract File Finder
        </Typography>

        <Grid container spacing={4}>
          <Grid size={{ xs:12, md: 4}}>
            <FileReaderAndUpload 
              onUploadSuccess={fetchFiles}
              apiBaseUrl={API_BASE_URL}
            />
          </Grid>

          <Grid size={{ xs:12, md: 8}}>
            <FileSearchAndList
              files={files}
              loading={loadingFiles}
              error={errorFiles}
              onViewContent={handleViewContent}
              onDeleteFile={handleDeleteFile}
              onSearchFiles={fetchFiles}
            />
          </Grid>

          <Grid size={{xs:12}}>
            {selectedFile && (
              <Box sx={{ mt: 4, p: 3, border: '1px solid gray', borderRadius: '4px', backgroundColor: 'background.paper' }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  Content of: {selectedFile.name}
                </Typography>
                <Box
                  component="pre" 
                  sx={{
                    whiteSpace: 'pre-wrap', 
                    wordWrap: 'break-word', 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    p: 2,
                    backgroundColor: 'background.default',
                    borderRadius: '4px',
                    border: '1px solid #333',
                  }}
                >
                  {selectedFileContent || ''}
                </Box>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setSelectedFileContent(null);
                    setSelectedFile(null);
                  }}
                >
                  Clear Content View
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default App
