import { Box, Container, Typography, Alert, Paper } from '@mui/material';
import DynamicQuestionForm from '../components/questions/DynamicQuestionForm';
import { UserInfo, QuestionResponse } from '../types';
import { questionsApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Questions = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (userInfo: UserInfo, responses: QuestionResponse[]) => {
    try {
      setError(null);
      const mealPlan = await questionsApi.submitResponses(userInfo, responses);
      navigate('/meal-plan', { state: { mealPlan } });
    } catch (error) {
      console.error('Error submitting responses:', error);
      setError('Failed to generate meal plan. Please try again.');
      throw error;
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e8eb 100%)',
        py: 6
      }}
    >
      <Container maxWidth="md">
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <Box sx={{
            background: 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)',
            py: 4,
            px: 3,
            color: 'white',
            textAlign: 'center'
          }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Your Personalized Meal Plan Journey
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Let's create a meal plan that perfectly matches your lifestyle and preferences
            </Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2
                }}
              >
                {error}
              </Alert>
            )}
            
            <DynamicQuestionForm onSubmit={handleSubmit} />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Questions; 