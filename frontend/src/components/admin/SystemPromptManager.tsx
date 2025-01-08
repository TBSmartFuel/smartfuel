import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/api';

interface SystemPrompt {
  id: number;
  name: string;
  prompt_text: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  prompt_text: string;
  description: string;
}

const initialFormData: FormData = {
  name: '',
  prompt_text: '',
  description: '',
};

const SystemPromptManager = () => {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllSystemPrompts();
      setPrompts(response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch system prompts';
      setError(errorMsg);
      console.error('Error fetching system prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (editingPrompt) {
        await adminApi.updateSystemPrompt(editingPrompt.id, formData);
      } else {
        await adminApi.createSystemPrompt(formData);
      }

      await fetchPrompts();
      setOpenDialog(false);
      setFormData(initialFormData);
      setEditingPrompt(null);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to save system prompt';
      setError(errorMsg);
      console.error('Error saving system prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (promptId: number, currentStatus: boolean) => {
    try {
      setLoading(true);
      setError(null);
      await adminApi.toggleSystemPromptActive(promptId);
      await fetchPrompts();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to update prompt status';
      setError(errorMsg);
      console.error('Error updating prompt status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promptId: number) => {
    if (window.confirm('Are you sure you want to delete this system prompt?')) {
      try {
        setLoading(true);
        setError(null);
        await adminApi.deleteSystemPrompt(promptId);
        await fetchPrompts();
      } catch (error: any) {
        const errorMsg = error.response?.data?.detail || 'Failed to delete system prompt';
        setError(errorMsg);
        console.error('Error deleting system prompt:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && prompts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Manage System Prompts</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditingPrompt(null);
            setFormData(initialFormData);
            setOpenDialog(true);
          }}
        >
          Add System Prompt
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell>{prompt.name}</TableCell>
                <TableCell>{prompt.description || '-'}</TableCell>
                <TableCell>
                  <Switch
                    checked={prompt.is_active}
                    onChange={() => handleToggleActive(prompt.id, prompt.is_active)}
                    disabled={loading}
                  />
                </TableCell>
                <TableCell>
                  {new Date(prompt.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setEditingPrompt(prompt);
                      setFormData({
                        name: prompt.name,
                        prompt_text: prompt.prompt_text,
                        description: prompt.description || '',
                      });
                      setOpenDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(prompt.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {prompts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No system prompts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPrompt ? 'Edit System Prompt' : 'Add System Prompt'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Prompt Text"
              value={formData.prompt_text}
              onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
              fullWidth
              multiline
              rows={6}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.prompt_text}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemPromptManager; 