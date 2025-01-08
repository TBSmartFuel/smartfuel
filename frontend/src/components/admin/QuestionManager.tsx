import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  IconButton,
  Dialog,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Question, QuestionFormData } from '../../types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { adminApi } from '../../services/api';

type QuestionType = 
  | 'text' 
  | 'number' 
  | 'boolean' 
  | 'multiple_choice' 
  | 'slider' 
  | 'radio' 
  | 'checkbox';

type QuestionCategory = 
  | 'personal_info'
  | 'goals'
  | 'food_intake'
  | 'workout_routine'
  | 'stress_levels'
  | 'toxicity_lifestyle'
  | 'waiver';

interface QuestionFormData {
  text: string;
  category: QuestionCategory;
  question_type: QuestionType;
  options: string[];
  order: number;
  is_active: boolean;
  field_key: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    minSelect?: number;
  };
}

const QuestionManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>({
    text: '',
    category: 'personal_info',
    question_type: 'text',
    options: [],
    order: 0,
    is_active: true,
    field_key: '',
    validation: {
      required: true
    }
  });

  const initialFormData: QuestionFormData = {
    text: '',
    category: 'personal_info',
    question_type: 'text',
    options: [],
    order: 0,
    is_active: true,
    field_key: '',
    validation: {
      required: true
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching admin questions...');
      const response = await adminApi.getQuestions();
      console.log('Admin questions:', response);
      setQuestions(response);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch questions';
      setError(errorMsg);
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSaveQuestion = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!formData.text || !formData.category || !formData.question_type) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.question_type === 'multiple_choice' && 
          (!formData.options || formData.options.length === 0)) {
        throw new Error("Multiple choice questions must have options");
      }

      const payload = {
        ...formData,
        options: formData.question_type === 'multiple_choice' ? 
                 formData.options.filter((opt: string) => opt.trim()) : 
                 [],
        order: editingQuestion ? formData.order : questions.length + 1,
        is_active: true
      };

      console.log('Attempting to save question with payload:', payload);

      let savedQuestion;
      if (editingQuestion) {
        savedQuestion = await adminApi.updateQuestion(editingQuestion.id, payload);
        console.log('Question updated:', savedQuestion);
      } else {
        savedQuestion = await adminApi.createQuestion(payload);
        console.log('Question created:', savedQuestion);
      }

      if (!savedQuestion) {
        throw new Error('Failed to save question - no response from server');
      }

      await fetchQuestions();
      
      setFormData({
        text: '',
        category: 'personal_info',
        question_type: 'text',
        options: [],
        order: questions.length + 1,
        is_active: true,
        field_key: '',
        validation: {
          required: true
        }
      });
      setEditingQuestion(null);
      setOpenDialog(false);

    } catch (error: any) {
      console.error('Error saving question:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save question';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        setLoading(true);
        setError(null);
        await adminApi.deleteQuestion(questionId);
        console.log('Question deleted successfully');
        await fetchQuestions();
      } catch (error: any) {
        console.error('Failed to delete question:', error);
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete question';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setQuestions(updatedItems);

    try {
      await adminApi.reorderQuestions(
        updatedItems.map(q => ({ id: q.id, order: q.order }))
      );
    } catch (error) {
      console.error('Failed to update question order:', error);
      await fetchQuestions();
    }
  };

  const renderQuestionTypeSpecificFields = () => {
    switch (formData.question_type) {
      case 'multiple_choice':
      case 'radio':
      case 'checkbox':
        return (
          <TextField
            fullWidth
            required
            multiline
            rows={3}
            label="Answer Options"
            placeholder="Enter each option on a new line"
            value={formData.options?.join('\n') || ''}
            onChange={(e) => setFormData({
              ...formData,
              options: e.target.value.split('\n').map(s => s.trim()).filter(s => s)
            })}
            margin="normal"
            error={!formData.options?.length}
            helperText={!formData.options?.length 
              ? "At least one option is required" 
              : "Enter each possible answer option on a new line"}
          />
        );
      case 'slider':
      case 'number':
        return (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Set the allowed range for the {formData.question_type === 'slider' ? 'slider' : 'number'} input:
            </Typography>
            <TextField
              label="Minimum Value"
              type="number"
              placeholder="e.g., 0"
              value={formData.validation?.min || ''}
              onChange={(e) => setFormData({
                ...formData,
                validation: {
                  ...formData.validation,
                  min: Number(e.target.value)
                }
              })}
            />
            <TextField
              label="Maximum Value"
              type="number"
              placeholder="e.g., 100"
              value={formData.validation?.max || ''}
              onChange={(e) => setFormData({
                ...formData,
                validation: {
                  ...formData.validation,
                  max: Number(e.target.value)
                }
              })}
            />
          </Stack>
        );
      default:
        return null;
    }
  };

  const getFieldKeyPlaceholder = (category: QuestionCategory) => {
    switch (category) {
      case 'personal_info':
        return 'personalInfo.yourFieldName (e.g., personalInfo.education)';
      case 'goals':
        return 'goals.yourFieldName (e.g., goals.weightTarget)';
      case 'food_intake':
        return 'diet.yourFieldName (e.g., diet.mealFrequency)';
      case 'workout_routine':
        return 'workout.yourFieldName (e.g., workout.exerciseFrequency)';
      case 'stress_levels':
        return 'wellness.yourFieldName (e.g., wellness.stressLevel)';
      case 'toxicity_lifestyle':
        return 'lifestyle.yourFieldName (e.g., lifestyle.smokingHabits)';
      case 'waiver':
        return 'waiver.yourFieldName (e.g., waiver.agreement)';
      default:
        return 'category.yourFieldName';
    }
  };

  const renderDialogContent = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
        {editingQuestion ? 'Edit Question' : 'Add New Question'}
      </Typography>
      
      <form onSubmit={(e) => { e.preventDefault(); handleSaveQuestion(); }}>
        <Stack spacing={3}>
          {/* Basic Information Section */}
          <Box>
            <Typography variant="subtitle1" color="primary" sx={{ mb: 2 }}>
              Basic Information
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                required
                label="Question Text"
                placeholder="Enter the question you want to ask the user"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                error={!formData.text}
                helperText={!formData.text ? "Question text is required" : "This is the actual question that will be shown to users"}
              />
              
              <TextField
                fullWidth
                required
                label="Response Storage Key"
                placeholder={getFieldKeyPlaceholder(formData.category)}
                value={formData.field_key}
                onChange={(e) => setFormData({ ...formData, field_key: e.target.value })}
                error={!formData.field_key}
                helperText={
                  !formData.field_key 
                    ? "Storage key is required" 
                    : "Use the format: category.fieldName (no spaces, use camelCase)"
                }
              />
            </Stack>
          </Box>

          {/* Question Category Section */}
          <Box>
            <Typography variant="subtitle1" color="primary" sx={{ mb: 2 }}>
              Question Category
            </Typography>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  category: e.target.value as QuestionCategory 
                })}
              >
                <MenuItem value="personal_info">👤 Personal Information</MenuItem>
                <MenuItem value="goals">🎯 Goals & Objectives</MenuItem>
                <MenuItem value="food_intake">🍽️ Food & Diet</MenuItem>
                <MenuItem value="workout_routine">💪 Exercise & Workout</MenuItem>
                <MenuItem value="stress_levels">🧘 Stress & Wellness</MenuItem>
                <MenuItem value="toxicity_lifestyle">🌿 Lifestyle Habits</MenuItem>
                <MenuItem value="waiver">📝 Terms & Waiver</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Response Type Section */}
          <Box>
            <Typography variant="subtitle1" color="primary" sx={{ mb: 2 }}>
              Response Type
            </Typography>
            <FormControl fullWidth required>
              <InputLabel>Answer Format</InputLabel>
              <Select
                value={formData.question_type}
                onChange={(e) => setFormData({
                  ...formData,
                  question_type: e.target.value as QuestionType
                })}
              >
                <MenuItem value="text">✍️ Text Input (Free form text)</MenuItem>
                <MenuItem value="number">🔢 Number Input (Numeric values)</MenuItem>
                <MenuItem value="boolean">✅ Yes/No (True/False)</MenuItem>
                <MenuItem value="multiple_choice">📋 Multiple Choice (Select multiple)</MenuItem>
                <MenuItem value="radio">⭕ Single Choice (Select one)</MenuItem>
                <MenuItem value="checkbox">☑️ Checkboxes (Multiple selections)</MenuItem>
                <MenuItem value="slider">📊 Slider (Range selection)</MenuItem>
              </Select>
            </FormControl>

            {/* Response Type Specific Fields */}
            <Box sx={{ mt: 2 }}>
              {renderQuestionTypeSpecificFields()}
            </Box>
          </Box>

          {/* Validation Section */}
          <Box>
            <Typography variant="subtitle1" color="primary" sx={{ mb: 2 }}>
              Answer Requirements
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.validation?.required || false}
                  onChange={(e) => setFormData({
                    ...formData,
                    validation: {
                      ...formData.validation,
                      required: e.target.checked
                    }
                  })}
                />
              }
              label="This question requires an answer"
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button 
              onClick={() => setOpenDialog(false)} 
              disabled={loading}
              variant="outlined"
              color="inherit"
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Saving...' : 'Save Question'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );

  const renderQuestionListItem = (question: Question) => (
    <ListItem
      component={Paper}
      sx={{ 
        mb: 2, 
        p: 2,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          {question.text}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip 
            label={question.category} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={question.question_type} 
            size="small" 
            color="secondary" 
            variant="outlined" 
          />
          {question.validation?.required && (
            <Chip 
              label="Required" 
              size="small" 
              color="error" 
              variant="outlined" 
            />
          )}
        </Stack>
        {question.options && question.options.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {question.options.map((option) => (
              <Chip
                key={option}
                label={option}
                size="small"
                sx={{ mr: 1, mt: 1 }}
              />
            ))}
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Field Key: {question.field_key}
        </Typography>
      </Box>
      <IconButton
        onClick={() => {
          setEditingQuestion(question);
          setFormData(question);
          setOpenDialog(true);
        }}
      >
        <EditIcon />
      </IconButton>
      <IconButton onClick={() => handleDeleteQuestion(question.id)}>
        <DeleteIcon />
      </IconButton>
    </ListItem>
  );

  if (loading) {
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
        <Typography variant="h6">Manage Questions</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditingQuestion(null);
            setFormData(initialFormData);
            setOpenDialog(true);
          }}
        >
          Add Question
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {questions.map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    renderQuestionListItem(question)
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        {renderDialogContent()}
      </Dialog>
    </Box>
  );
};

export default QuestionManager; 