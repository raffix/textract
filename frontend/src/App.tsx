import { useCallback } from 'react';
import { Typography, Container, Box } from '@mui/material';

import FileReaderAndUpload from './components/FileReaderAndUpload';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {

  const fetchFiles = useCallback(async () => {
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Textract File Finder
        </Typography>

        <FileReaderAndUpload
          onUploadSuccess={fetchFiles}
          apiBaseUrl={API_BASE_URL}
        />

      </Box>
    </Container>
  );
}

export default App
