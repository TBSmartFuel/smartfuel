import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
  LinearProgress,
  Alert,
} from '@mui/material';
import QuestionItem from './QuestionItem';
import UserInfoForm from './UserInfoForm';
import { Question, QuestionResponse, UserInfo } from '../../types';
import { questionsApi } from '../../services/api';
import ReviewStep from './ReviewStep';

type RequiredFields = {
  personalInfo: string[];
  goalsInfo: string[];
  foodIntake: {
    dailyMeals: string[];
    preferences: string[];
  };
};

type SectionKey = keyof UserInfo;

const QuestionForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [sections, setSections] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Fetch questions when component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Initiating question fetch...');

        const fetchedQuestions = await questionsApi.getQuestions();
        console.log('Questions received:', fetchedQuestions);

        if (!Array.isArray(fetchedQuestions)) {
          throw new Error('Invalid response format');
        }

        if (fetchedQuestions.length === 0) {
          setError('No questions are currently available');
          return;
        }

        // Set questions
        setQuestions(fetchedQuestions);

        // Process categories
        const categories = fetchedQuestions
          .map(q => q.category)
          .filter((value, index, self) => self.indexOf(value) === index);

        console.log('Available categories:', categories);
        setSections(categories);

        if (categories.length > 0) {
          setCurrentSection(categories[0]);
        }

      } catch (error: any) {
        console.error('Question fetch error:', error);
        const errorMessage = error.response?.data?.detail || 
                           error.message || 
                           'Failed to load questions';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Update the question filtering logic
  const getCurrentQuestions = () => {
    if (!currentSection) return [];
    return questions
      .filter(q => q.category === currentSection)
      .sort((a, b) => a.order - b.order);
  };

  // Calculate progress
  useEffect(() => {
    if (questions.length > 0) {
      const progress = (responses.length / questions.length) * 100;
      setProgress(progress);
    }
  }, [responses, questions]);

  // Validate current section before proceeding
  const validateSection = () => {
    const errors: {[key: string]: string} = {};
    const currentQuestions = questions.filter(q => q.category === currentSection);
    
    currentQuestions.forEach(question => {
      const response = responses.find(r => r.question_id === question.id);
      if (!response || !response.answer.trim()) {
        errors[question.id] = 'This question requires an answer';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add this function to check if all required fields are filled
  const validateAllFields = () => {
    if (!userInfo) return { isValid: false, missingFields: ['Personal Information'] };

    const requiredFields: RequiredFields = {
      personalInfo: ['name', 'age', 'height', 'weight'],
      goalsInfo: ['primaryGoals', 'feelGoals', 'prioritizedGoals', 'challengeGoals', 'preferredDiet'],
      foodIntake: {
        dailyMeals: ['breakfast', 'lunch', 'dinner'],
        preferences: ['likedFoods', 'dislikedFoods']
      }
    };

    let missingFields: string[] = [];

    // Check personalInfo and goalsInfo
    (Object.keys(requiredFields) as Array<keyof RequiredFields>).forEach(section => {
      const fields = requiredFields[section];
      if (section === 'foodIntake') {
        Object.entries(fields).forEach(([subSection, subFields]) => {
          subFields.forEach((field: string) => {
            const sectionData = userInfo[section as SectionKey];
            if (typeof sectionData === 'object' && sectionData !== null) {
              const subSectionData = sectionData[subSection as keyof typeof sectionData];
              if (typeof subSectionData === 'object' && subSectionData !== null) {
                const value = subSectionData[field as keyof typeof subSectionData];
                if (!value) {
                  missingFields.push(`${section}.${subSection}.${field}`);
                }
              }
            }
          });
        });
      } else {
        (fields as string[]).forEach((field: string) => {
          const sectionData = userInfo[section as SectionKey];
          if (typeof sectionData === 'object' && sectionData !== null) {
            const value = sectionData[field as keyof typeof sectionData];
            if (!value) {
              missingFields.push(`${section}.${field}`);
            }
          }
        });
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  // Update the handleNext function
  const handleNext = async () => {
    if (activeStep === steps.length - 2) { // Before Review step
      const { isValid, missingFields } = validateAllFields();
      if (!isValid) {
        setError(`Please complete the following required fields: ${missingFields.join(', ')}`);
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
      navigate('/');
    }
  };

  const handleUserInfoSubmit = async (data: UserInfo): Promise<void> => {
    try {
      console.log('User info submitted:', data);
      setUserInfo(data);
      if (data.personalInfo && data.goalsInfo && data.foodIntake) {
        setActiveStep(1);
      }
    } catch (error) {
      console.error('Error handling user info submission:', error);
      setError('Failed to process user information');
      throw error; // Re-throw to maintain Promise<void> return type
    }
  };

  const handleQuestionAnswer = (questionId: number, answer: string | string[]) => {
    const answerStr = Array.isArray(answer) ? answer.join(',') : answer;
    setResponses((prev) => {
      const existing = prev.findIndex((r) => r.question_id === questionId);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { question_id: questionId, answer: answerStr };
        return updated;
      }
      return [...prev, { question_id: questionId, answer: answerStr }];
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userInfo || responses.length === 0) {
        throw new Error('Please complete all sections before generating meal plan');
      }

      const result = await questionsApi.submitResponses(userInfo, responses);
      navigate('/meal-plan', { state: { mealPlan: result } });
    } catch (error: any) {
      console.error('Failed to generate meal plan:', error);
      setError(error.message || 'Failed to generate meal plan');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Personal Information', 'Questionnaire', 'Review'];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <UserInfoForm onSubmit={handleUserInfoSubmit} />;
      case 1:
        return renderQuestionnaireStep();
      case 2:
        return userInfo ? (
          <ReviewStep
            userInfo={userInfo}
            responses={responses}
            questions={questions}
            onEdit={() => setActiveStep(1)}
            onSubmit={handleSubmit}
          />
        ) : (
          <Typography color="error">
            Personal information is missing. Please go back and fill it in.
          </Typography>
        );
      default:
        return null;
    }
  };

  // Modify the questionnaire step to show progress and sections
  const renderQuestionnaireStep = () => (
    <Box>
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ mb: 3 }} 
      />
      
      {/* Section Navigation */}
      <Box sx={{ mb: 4 }}>
        {sections.map((section) => (
          <Button
            key={section}
            variant={currentSection === section ? "contained" : "outlined"}
            onClick={() => setCurrentSection(section)}
            sx={{ mr: 1, mb: 1 }}
          >
            {section}
          </Button>
        ))}
      </Box>

      {questions.length > 0 ? (
        <>
          <Typography variant="h6" gutterBottom>
            {currentSection}
          </Typography>

          {getCurrentQuestions().map((question) => {
            const currentAnswer = responses.find(r => r.question_id === question.id)?.answer || '';
            return (
              <QuestionItem
                key={question.id}
                question={question}
                onAnswer={(answer) => handleQuestionAnswer(question.id, answer)}
                value={currentAnswer}
                error={validationErrors[question.id]}
              />
            );
          })}
        </>
      ) : (
        <Typography color="text.secondary" align="center">
          No questions available
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
        >
          {activeStep === steps.length - 1 ? 'Review' : 'Next'}
        </Button>
      </Box>
    </Box>
  );

  // Add loading state UI
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography>
            {activeStep === steps.length - 1 
              ? 'Generating your personalized meal plan...'
              : 'Loading questions...'}
          </Typography>
        </Box>
      );
    }

    return (
      <>
        {renderStepContent(activeStep)}
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          mt: 4,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}>
          <Button
            onClick={handleCancel}
            color="error"
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          {activeStep === steps.length - 1 && (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              Generate Meal Plan
            </Button>
          )}
        </Box>
      </>
    );
  };

  useEffect(() => {
    console.log('Current step:', activeStep);
    console.log('User info:', userInfo);
  }, [activeStep, userInfo]);

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading questions...</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
              Create Your Meal Plan
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Let's gather some information to create your personalized meal plan
            </Typography>
          </Box>

          <Stepper 
            activeStep={activeStep} 
            sx={{ mb: 4 }}
            alternativeLabel
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderContent()}
        </>
      )}
    </Box>
  );
};

export default QuestionForm; 