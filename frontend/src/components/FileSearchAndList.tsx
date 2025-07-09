import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import Clear from '@mui/icons-material/Clear'
import { useToast } from '../contexts/ToastContext';

export interface FileMetadata {
  _id: string;
  name: string;
  fileType: string;
  uploadDate: string;
}

interface FileSearchAndListProps {
  files: FileMetadata[];
  loading: boolean;
  error: string | null;
  onViewContent: (fileId: string, name: string) => void;
  onDeleteFile: (fileId: string) => void;
  onSearchFiles: (searchTerm?: string) => void;
}

const FileSearchAndList: React.FC<FileSearchAndListProps> = ({
  files,
  loading,
  error,
  onViewContent,
  onDeleteFile,
  onSearchFiles
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewContentError, setViewContentError] = useState<string | null>(null);
  const [viewContentLoading, setViewContentLoading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const { showToast } = useToast();

  const handleClearSearch = () => {
    setSearchTerm('');
    showToast('Search cleared', 'info');
  };

  const handleSearch = async () => {
    try {
      await onSearchFiles(searchTerm)
    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred while fetching content.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setViewContentError(`Failed to fetch content: ${errorMessage}`);
      console.error('Failed to fetch content:', err);
    }
  }

  const handleViewContentInternal = async (fileId: string, name: string) => {
    setViewContentLoading(true);
    setViewContentError(null);
    try {
      await onViewContent(fileId, name);
    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred while fetching content.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setViewContentError(`Failed to fetch content: ${errorMessage}`);
      console.error('Failed to fetch content:', err);
    } finally {
      setViewContentLoading(false);
    }
  };

  const handleDeleteFileInternal = async (fileId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }
    setDeletingFileId(fileId);
    try {
      await onDeleteFile(fileId);
    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred during deletion.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      alert(`Error deleting file: ${errorMessage}`);
      console.error('Failed to delete file:', err);
    } finally {
      setDeletingFileId(null);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Uploaded Files
      </Typography>

      <TextField
        label="Search in the files"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <>
                <InputAdornment position="start">
                  <IconButton
                    aria-label="clear search"
                    onClick={handleSearch}
                    edge="end"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              </>
            ),
          }
        }}
        sx={{ mb: 3 }}
      />

      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}
      {error && (
        <Typography color="error" variant="body2" sx={{ textAlign: 'center' }}>
          Error: {error}
        </Typography>
      )}
      {!loading && files.length === 0 && !error && (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
          No files match your search or no files uploaded yet.
        </Typography>
      )}
      {viewContentLoading && (
        <Typography variant="body2" sx={{ ml: 2, display: 'inline-block' }}>
          Loading content... <CircularProgress size={15} color="inherit" />
        </Typography>
      )}
      {viewContentError && (
        <Typography color="error" variant="body2" sx={{ textAlign: 'center' }}>
          {viewContentError}
        </Typography>
      )}
      <List>
        {files.map((file) => (
          <ListItem
            key={file._id}
            secondaryAction={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleViewContentInternal(file._id, file.name)}
                  disabled={viewContentLoading || deletingFileId === file._id}
                >
                  View Content
                </Button>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteFileInternal(file._id, file.name)}
                  disabled={deletingFileId === file._id || viewContentLoading}
                >
                  {deletingFileId === file._id ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <DeleteIcon />
                  )}
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={file.name}
              secondary={`Type: ${file.fileType} | Uploaded: ${new Date(file.uploadDate).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FileSearchAndList;