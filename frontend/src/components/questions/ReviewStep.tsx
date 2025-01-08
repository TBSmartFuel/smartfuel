import { Box, Button, Typography, Paper, Grid, CircularProgress, Divider, Alert } from '@mui/material';
import { UserInfo, Question, QuestionResponse, QuestionType } from '../../types';
import { useState } from 'react';

interface ReviewStepProps {
  userInfo: UserInfo;
  responses: QuestionResponse[];
  questions: Question[];
  onEdit: () => void;
  onSubmit: (userInfo: UserInfo) => Promise<void>;
}

type QuestionValue = 
  | string 
  | number 
  | boolean 
  | string[] 
  | { [key: string]: string | number | boolean | string[] }
  | null;

type ResponseWithQuestion = {
  question_id: number;
  answer: QuestionValue;
  question: Question;
};

const ReviewStep: React.FC<ReviewStepProps> = ({
  userInfo,
  responses,
  questions,
  onEdit,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      // Check waiver responses before submitting
      const waiverQuestions = responses.filter(response => {
        const question = questions.find(q => q.id === response.question_id);
        return question?.category === 'WAIVER';
      });

      // Validate all waiver questions must be true
      const invalidWaivers = waiverQuestions.filter(response => {
        return response.answer !== true;
      });

      if (invalidWaivers.length > 0) {
        const invalidQuestions = invalidWaivers.map(response => {
          const question = questions.find(q => q.id === response.question_id);
          return question?.text;
        }).join('\n• ');
        
        setError(`Please agree to all terms and conditions:\n• ${invalidQuestions}`);
        return;
      }

      setIsSubmitting(true);
      setError(null);
      await onSubmit(userInfo);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate meal plan. Please try again.');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumberValue = (value: any, questionType: string) => {
    // Convert value to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Return 'Not provided' if value is null, undefined, or NaN
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return 'Not provided';
    }

    // Format based on question type
    switch (questionType) {
      case QuestionType.SLIDER:
        return `${numValue}%`;
      case 'age':
        return Math.round(numValue).toString(); // No decimals for age
      case 'percentage':
        return `${numValue.toFixed(1)}%`; // One decimal for percentages
      default:
        return numValue.toFixed(1); // One decimal for other measurements
    }
  };

  const renderResponseValue = (response: QuestionValue, questionType: string, category: string) => {
    if (response === null || response === undefined) {
      return 'Not provided';
    }

    // Handle waiver responses first
    if (category === 'WAIVER') {
      const isAgreed = typeof response === 'string' ? 
        response.toLowerCase() === 'true' : Boolean(response);
      
      if (!isAgreed) {
        return (
          <Typography 
            component="span" 
            color="error.main" 
            sx={{ 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            Not Agreed <span style={{ color: '#666', fontSize: '0.9em' }}>(Agreement Required)</span>
          </Typography>
        );
      }
      return (
        <Typography 
          component="span" 
          color="success.main" 
          sx={{ fontWeight: 500 }}
        >
          Agreed
        </Typography>
      );
    }

    // Handle numeric fields
    if (questionType === QuestionType.NUMBER) {
      const questionText = questions.find(q => 
        q.question_type === questionType && 
        q.category === category
      )?.text.toLowerCase() || '';

      if (questionText.includes('age')) {
        return formatNumberValue(response, 'age');
      } else if (questionText.includes('percentage')) {
        return formatNumberValue(response, 'percentage');
      } else {
        return formatNumberValue(response, questionType);
      }
    }

    // Handle other question types
    switch (questionType) {
      case QuestionType.BOOLEAN:
        return typeof response === 'boolean' ? 
          (response ? 'Yes' : 'No') : 
          'Invalid response';

      case QuestionType.NUMBER:
      case QuestionType.SLIDER:
        return typeof response === 'number' ? 
          formatNumberValue(response, questionType) : 'Invalid number';

      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.CHECKBOX:
        if (Array.isArray(response)) {
          return response.length > 0 ? response.join(', ') : 'None selected';
        }
        return 'Invalid selection';

      case QuestionType.MEAL_INPUT:
        if (typeof response === 'object' && response !== null) {
          const meal = response as { description: string; isHomeCooked: boolean };
          return `${meal.description} ${meal.isHomeCooked ? '(Home Cooked)' : '(Not Home Cooked)'}`;
        }
        return 'Invalid meal input';

      case QuestionType.DRINK_DETAILS:
        if (typeof response === 'object' && response !== null) {
          const drink = response as { 
            type: string; 
            organic?: boolean; 
            additives?: string[]; 
            frequency?: string;
            quantity?: string;
          };
          const details = [];
          if (drink.type) details.push(drink.type);
          if (drink.organic !== undefined) details.push(`Organic: ${drink.organic ? 'Yes' : 'No'}`);
          if (drink.additives?.length) details.push(`Additives: ${drink.additives.join(', ')}`);
          if (drink.frequency) details.push(`${drink.frequency}`);
          if (drink.quantity) details.push(`${drink.quantity}`);
          return details.join(' | ');
        }
        return 'Invalid drink details';

      case QuestionType.TEXT:
      case QuestionType.RADIO:
        return response?.toString() || 'Not provided';

      default:
        if (typeof response === 'object' && response !== null) {
          return Object.entries(response)
            .filter(([_, value]) => value !== null && value !== undefined)
            .map(([key, value]) => {
              const formattedKey = key.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
              return typeof value === 'boolean' ? 
                `${formattedKey}: ${value ? 'Yes' : 'No'}` : 
                `${formattedKey}: ${value}`;
            })
            .join(' | ');
        }
        return response?.toString() || 'Not provided';
    }
  };

  // Sort questions by their order property
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

  // Get unique categories in the order they appear in sorted questions
  const orderedCategories = Array.from(new Set(
    sortedQuestions.map(q => q.category)
  ));

  const groupedResponses = responses.reduce((acc: { [key: string]: ResponseWithQuestion[] }, response) => {
    const question = questions.find(q => q.id === response.question_id);
    if (question) {
      const category = question.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        question_id: response.question_id,
        answer: response.answer,
        question
      });

      // Sort responses within each category by question order
      acc[category].sort((a, b) => a.question.order - b.question.order);
    }
    return acc;
  }, {});

  // Check if there are any responses
  if (responses.length === 0) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No responses found. Please complete the questionnaire first.
        </Alert>
        <Button variant="contained" onClick={onEdit}>
          Go Back to Questionnaire
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        px: 2
      }}
    >
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          mb: 4,
          textAlign: 'center',
          fontWeight: 600,
          color: 'primary.main',
          borderBottom: '3px solid',
          borderColor: 'primary.main',
          pb: 1
        }}
      >
        Review Your Responses
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 3, 
          width: '100%',
          borderRadius: 2,
          backgroundColor: 'background.paper',
          boxShadow: theme => `0 4px 20px ${theme.palette.action.hover}`
        }}
      >
        {orderedCategories.map(category => {
          const categoryResponses = groupedResponses[category] || [];
          if (categoryResponses.length === 0) return null;

          return (
            <Box 
              key={category} 
              mb={4}
              sx={{
                '&:last-child': {
                  mb: 0
                }
              }}
            >
              <Typography 
                variant="h6" 
                color="primary" 
                gutterBottom 
                sx={{ 
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  pb: 1,
                  mb: 3,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    width: '4px',
                    height: '24px',
                    backgroundColor: 'primary.main',
                    marginRight: 2,
                    borderRadius: 1
                  }
                }}
              >
                {category.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ')}
              </Typography>
              
              {categoryResponses.map(({ question_id, answer, question }) => (
                <Box 
                  key={question_id} 
                  mb={2}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 3,
                    alignItems: 'baseline',
                    p: 1.5,
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateX(8px)'
                    },
                    '&:not(:last-child)': {
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    },
                    ...(question.category === 'WAIVER' && answer === false && {
                      backgroundColor: 'error.lighter',
                      borderLeft: '4px solid',
                      borderLeftColor: 'error.main',
                    })
                  }}
                >
                  <Typography 
                    variant="body1" 
                    color="text.primary"
                    sx={{ 
                      fontWeight: 500,
                      fontSize: '1rem',
                      ...(question.category === 'WAIVER' && {
                        '&::after': {
                          content: '" *"',
                          color: 'error.main',
                        }
                      })
                    }}
                  >
                    {question.text}:
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      textAlign: 'right',
                      fontWeight: 400,
                      fontSize: '1rem'
                    }}
                  >
                    {renderResponseValue(answer, question.question_type, question.category)}
                  </Typography>
                </Box>
              ))}
            </Box>
          );
        })}
      </Paper>

      <Box 
        mt={4} 
        display="flex" 
        justifyContent="space-between"
        width="100%"
        maxWidth="500px"
      >
        <Button
          variant="outlined"
          onClick={onEdit}
          disabled={isSubmitting}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          Back to Edit
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            minWidth: 200,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4
            }
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              Generating...
            </>
          ) : (
            'Generate Meal Plan'
          )}
        </Button>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2,
            width: '100%',
            maxWidth: '500px',
            borderRadius: 2
          }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ReviewStep; 