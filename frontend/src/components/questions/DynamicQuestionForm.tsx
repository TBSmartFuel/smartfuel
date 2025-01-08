import { useState, useEffect } from 'react';
import { useForm, Controller, FieldErrors } from 'react-hook-form';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Slider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  FormHelperText,
} from '@mui/material';
import { UserInfo, Question, QuestionResponse, QuestionType } from '../../types';
import { questionsApi } from '../../services/api';
import ReviewStep from './ReviewStep';
import { useNavigate } from 'react-router-dom';

interface DynamicQuestionFormProps {
  onSubmit: (userInfo: UserInfo, responses: QuestionResponse[]) => Promise<void>;
}

const DynamicQuestionForm = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const navigate = useNavigate();

  const { control, handleSubmit, getValues, formState: { errors }, setValue, watch } = useForm<any>();

  // First fetch questions, then fetch responses
  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true);
        // First fetch questions
        const fetchedQuestions = await questionsApi.getQuestions();
        console.log('Fetched questions:', fetchedQuestions);
        
        if (!fetchedQuestions || !Array.isArray(fetchedQuestions)) {
          throw new Error('Invalid questions format from server');
        }
        
        if (fetchedQuestions.length === 0) {
          throw new Error('No questions available');
        }

        const sortedQuestions = fetchedQuestions.sort((a, b) => a.order - b.order);
        setQuestions(sortedQuestions);

        // Then fetch responses
        const userResponses = await questionsApi.getUserResponses();
        console.log('Raw user responses from API:', userResponses);

        // Find the full name question and its response
        const fullNameQuestion = sortedQuestions.find(q => q.text === "What is your full name?");
        if (fullNameQuestion) {
          const fullNameResponse = userResponses.find(r => r.question_id === fullNameQuestion.id);
          console.log('Full name question and response:', {
            question: fullNameQuestion,
            response: fullNameResponse,
            response_value: fullNameResponse?.answer
          });
        }

        if (userResponses && Array.isArray(userResponses) && userResponses.length > 0) {
          setResponses(userResponses);
          
          // Map responses to form fields
          userResponses.forEach(response => {
            const question = sortedQuestions.find(q => q.id === response.question_id);
            if (question && response.answer !== undefined && response.answer !== null) {
              console.log(`Processing response for question ${question.id}:`, {
                question_type: question.question_type,
                field_key: question.field_key,
                raw_answer: response.answer,
                answer_type: typeof response.answer,
                question_text: question.text,
                full_question: question,
                is_fullname_question: question.text === "What is your full name?"
              });
              
              try {
                switch (question.question_type) {
                  case QuestionType.CHECKBOX:
                  case QuestionType.MULTIPLE_CHOICE:
                    const arrayValue = Array.isArray(response.answer) ? response.answer : 
                                     typeof response.answer === 'string' ? [response.answer] : 
                                     typeof response.answer === 'object' ? Object.values(response.answer) : [];
                    console.log('Setting array value:', arrayValue);
                    setValue(question.field_key, arrayValue);
                    break;

                  case QuestionType.BOOLEAN:
                    const boolValue = typeof response.answer === 'string' ? 
                                      response.answer.toLowerCase() === 'true' : Boolean(response.answer);
                    console.log('Setting boolean value:', boolValue);
                    setValue(question.field_key, boolValue);
                    break;

                  case QuestionType.NUMBER:
                  case QuestionType.SLIDER:
                    let numValue: number;
                    if (typeof response.answer === 'string') {
                      numValue = parseFloat(response.answer);
                    } else if (typeof response.answer === 'number') {
                      numValue = response.answer;
                    } else if (typeof response.answer === 'object' && response.answer !== null) {
                      numValue = parseFloat(Object.values(response.answer)[0] as string);
                    } else {
                      numValue = 0;
                    }
                    console.log('Setting numeric value:', numValue);
                    setValue(question.field_key, isNaN(numValue) ? 0 : numValue);
                    break;

                  case QuestionType.RADIO:
                    let radioValue = '';
                    if (typeof response.answer === 'string') {
                      radioValue = response.answer;
                    } else if (typeof response.answer === 'object' && response.answer !== null) {
                      radioValue = Object.values(response.answer)[0] as string;
                    }
                    const validValue = question.options?.includes(radioValue) ? radioValue : '';
                    console.log('Setting radio value:', validValue);
                    setValue(question.field_key, validValue);
                    break;

                  case QuestionType.TEXT:
                    let textValue = '';
                    if (typeof response.answer === 'string') {
                      textValue = response.answer;
                    } else if (typeof response.answer === 'object' && response.answer !== null) {
                      textValue = Object.values(response.answer)[0] as string;
                    }
                    console.log('Setting text value for', question.field_key, ':', textValue);
                    setValue(question.field_key, textValue);
                    break;

                  case QuestionType.MEAL_INPUT:
                    const mealValue = typeof response.answer === 'object' ? response.answer : {
                      description: typeof response.answer === 'string' ? response.answer : '',
                      isHomeCooked: false
                    };
                    console.log('Setting meal value:', mealValue);
                    setValue(question.field_key, mealValue);
                    break;

                  case QuestionType.DRINK_DETAILS:
                    const drinkValue = typeof response.answer === 'object' ? response.answer : {
                      type: typeof response.answer === 'string' ? response.answer : '',
                      organic: false,
                      additives: [],
                      frequency: '',
                      quantity: ''
                    };
                    console.log('Setting drink value:', drinkValue);
                    setValue(question.field_key, drinkValue);
                    break;

                  default:
                    console.log('Setting default value:', response.answer);
                    setValue(question.field_key, response.answer);
                }
              } catch (error) {
                console.error(`Error setting value for ${question.field_key}:`, error);
              }
            }
          });

          // Set initial category to first one with responses
          const firstResponseQuestion = sortedQuestions.find(q => 
            userResponses.some(r => r.question_id === q.id)
          );
          if (firstResponseQuestion) {
            const categories = Array.from(new Set(sortedQuestions.map(q => q.category)));
            const categoryIndex = categories.findIndex(cat => cat === firstResponseQuestion.category);
            if (categoryIndex !== -1) {
              setCurrentCategory(categoryIndex);
            }
          }
        }
      } catch (err: any) {
        console.error('Error initializing form:', err);
        setError(err.message || 'Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
  }, [setValue]);

  // Log form values when they change
  useEffect(() => {
    const subscription = watch((value) => {
      console.log('Form values changed:', value);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const updateResponses = (question: Question, value: any) => {
    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.question_id === question.id);
      const newResponse: QuestionResponse = {
        question_id: question.id,
        answer: question.question_type === QuestionType.BOOLEAN ? Boolean(value) : value
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newResponse;
        return updated;
      }

      return [...prev, newResponse];
    });
  };

  // Helper function to deep merge objects
  const mergeDeep = (target: Record<string, any>, source: Record<string, any>): Record<string, any> => {
    const output = { ...target };
    
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  };

  const isObject = (item: any): item is Record<string, any> => {
    return item && typeof item === 'object' && !Array.isArray(item);
  };

  const getFieldError = (field_key: string, errors: FieldErrors<UserInfo>) => {
    const parts = field_key.split('.');
    let current: any = errors;
    for (const part of parts) {
      if (!current[part]) return undefined;
      current = current[part];
    }
    return current;
  };

  const renderQuestion = (question: Question) => {
    const existingResponse = responses.find(r => r.question_id === question.id);
    console.log(`Rendering question ${question.text}:`, { existingResponse, fieldKey: question.field_key });
    
    switch (question.question_type) {
      case QuestionType.TEXT:
        return (
          <Controller
            name={question.field_key}
            control={control}
            defaultValue={existingResponse?.answer || ''}
            rules={{ required: question.validation.required }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value || ''}
                fullWidth
                label={question.text}
                error={!!error}
                helperText={error?.message || question.validation?.required ? 'This field is required' : ''}
                margin="normal"
                multiline={question.text.length > 50}
                rows={question.text.length > 50 ? 3 : 1}
                onChange={(e) => {
                  field.onChange(e);
                  updateResponses(question, e.target.value);
                }}
              />
            )}
          />
        );

      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.CHECKBOX:
        return (
          <Controller
            name={question.field_key as any}
            control={control}
            defaultValue={existingResponse?.answer || []}
            rules={{
              required: question.validation.required,
              validate: (value: string[]) =>
                !question.validation.minSelect ||
                value.length >= question.validation.minSelect ||
                `Please select at least ${question.validation.minSelect} options`,
            }}
            render={({ field }) => (
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend">{question.text}</FormLabel>
                <FormGroup>
                  {question.options?.map((option) => (
                    <FormControlLabel
                      key={option}
                      control={
                        <Checkbox
                          checked={field.value?.includes(option)}
                          onChange={(e) => {
                            const newValue = e.target.checked
                              ? [...(field.value || []), option]
                              : field.value?.filter((v: string) => v !== option);
                            field.onChange(newValue);
                            updateResponses(question, newValue);
                          }}
                        />
                      }
                      label={option}
                    />
                  ))}
                </FormGroup>
                {question.validation.required && (!field.value || field.value.length === 0) && (
                  <FormHelperText error>Please select at least one option</FormHelperText>
                )}
              </FormControl>
            )}
          />
        );

      case QuestionType.MEAL_INPUT:
        return (
          <Controller
            name={question.field_key as any}
            control={control}
            defaultValue={existingResponse?.answer || { description: '', isHomeCooked: false }}
            rules={{ required: question.validation.required }}
            render={({ field }) => (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography gutterBottom>{question.text}</Typography>
                <TextField
                  fullWidth
                  label="Meal Description"
                  value={field.value?.description || ''}
                  onChange={(e) => {
                    const newValue = {
                      ...field.value,
                      description: e.target.value
                    };
                    field.onChange(newValue);
                    updateResponses(question, newValue);
                  }}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value?.isHomeCooked || false}
                      onChange={(e) => {
                        const newValue = {
                          ...field.value,
                          isHomeCooked: e.target.checked
                        };
                        field.onChange(newValue);
                        updateResponses(question, newValue);
                      }}
                    />
                  }
                  label="Home Cooked"
                />
              </Box>
            )}
          />
        );

      case QuestionType.DRINK_DETAILS:
        return (
          <Controller
            name={question.field_key as any}
            control={control}
            defaultValue={existingResponse?.answer || { type: '', organic: false, additives: [], frequency: '', quantity: '' }}
            rules={{ required: question.validation.required }}
            render={({ field }) => (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography gutterBottom>{question.text}</Typography>
                <TextField
                  fullWidth
                  label="Type"
                  value={field.value?.type || ''}
                  onChange={(e) => {
                    const newValue = {
                      ...field.value,
                      type: e.target.value
                    };
                    field.onChange(newValue);
                    updateResponses(question, newValue);
                  }}
                  margin="normal"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value?.organic || false}
                      onChange={(e) => {
                        const newValue = {
                          ...field.value,
                          organic: e.target.checked
                        };
                        field.onChange(newValue);
                        updateResponses(question, newValue);
                      }}
                    />
                  }
                  label="Organic"
                />
                <TextField
                  fullWidth
                  label="Frequency"
                  value={field.value?.frequency || ''}
                  onChange={(e) => {
                    const newValue = {
                      ...field.value,
                      frequency: e.target.value
                    };
                    field.onChange(newValue);
                    updateResponses(question, newValue);
                  }}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Quantity"
                  value={field.value?.quantity || ''}
                  onChange={(e) => {
                    const newValue = {
                      ...field.value,
                      quantity: e.target.value
                    };
                    field.onChange(newValue);
                    updateResponses(question, newValue);
                  }}
                  margin="normal"
                />
              </Box>
            )}
          />
        );

      case QuestionType.NUMBER:
        return (
          <Controller
            name={question.field_key as any}
            control={control}
            defaultValue={existingResponse?.answer || ''}
            rules={{
              required: question.validation.required,
              min: question.validation.min,
              max: question.validation.max,
            }}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                value={field.value || ''}
                fullWidth
                label={question.text}
                error={!!getFieldError(question.field_key, errors)}
                helperText={getFieldError(question.field_key, errors)?.message}
                margin="normal"
                onChange={(e) => {
                  field.onChange(e);
                  updateResponses(question, e.target.value);
                }}
              />
            )}
          />
        );

      case QuestionType.BOOLEAN:
        return (
          <Controller
            name={question.field_key as any}
            control={control}
            defaultValue={existingResponse?.answer || false}
            rules={{ 
              required: question.validation.required ? 'Please select an option' : false,
              validate: value => {
                if (question.category === 'WAIVER') {
                  return value === true || 'You must agree to proceed';
                }
                return true;
              }
            }}
            render={({ field, fieldState: { error } }) => (
              <FormControl 
                component="fieldset" 
                margin="normal"
                error={!!error}
                required={question.validation.required}
              >
                <FormLabel component="legend">{question.text}</FormLabel>
                <RadioGroup 
                  {...field}
                  value={field.value === true ? "true" : field.value === false ? "false" : ""}
                  onChange={(e) => {
                    const value = e.target.value === "true";
                    if (question.category === 'WAIVER' && !value) {
                      // Show error immediately for waiver questions if "I Do Not Agree" is selected
                      setError('You must agree to all terms to continue');
                    } else {
                      setError(null);
                    }
                    field.onChange(value);
                    updateResponses(question, value);
                  }}
                >
                  <FormControlLabel 
                    value="true" 
                    control={<Radio />} 
                    label={question.category === 'WAIVER' ? "I Agree" : "Yes"} 
                  />
                  <FormControlLabel 
                    value="false" 
                    control={<Radio />} 
                    label={question.category === 'WAIVER' ? "I Do Not Agree" : "No"} 
                  />
                </RadioGroup>
                {error && (
                  <FormHelperText error>
                    {error.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        );

      case QuestionType.RADIO:
        return (
          <Controller
            name={question.field_key as any}
            control={control}
            defaultValue={existingResponse?.answer || ''}
            rules={{ required: question.validation.required }}
            render={({ field }) => (
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend">{question.text}</FormLabel>
                <RadioGroup 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => {
                    field.onChange(e);
                    updateResponses(question, e.target.value);
                  }}
                >
                  {question.options?.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
                {question.validation.required && !field.value && (
                  <FormHelperText error>This field is required</FormHelperText>
                )}
              </FormControl>
            )}
          />
        );

      case QuestionType.SLIDER:
        return (
          <Controller
            name={question.field_key as any}
            control={control}
            defaultValue={existingResponse?.answer || 0}
            rules={{ required: question.validation.required }}
            render={({ field }) => (
              <Box sx={{ width: '100%', mt: 3, mb: 2 }}>
                <Typography gutterBottom>{question.text}</Typography>
                <Slider
                  {...field}
                  value={field.value || 0}
                  min={question.validation.min || 0}
                  max={question.validation.max || 100}
                  valueLabelDisplay="auto"
                  marks
                  onChange={(_, value) => {
                    field.onChange(value);
                    updateResponses(question, value);
                  }}
                />
                {question.validation.required && field.value === 0 && (
                  <FormHelperText error>Please select a value</FormHelperText>
                )}
              </Box>
            )}
          />
        );

      default:
        console.warn(`Unhandled question type: ${question.question_type}`);
        return null;
    }
  };

  const handleNext = async () => {
    const formData = getValues();
    
    try {
      // Get current category questions
      const currentQuestions = questions.filter(q => q.category === categories[currentCategory]);
      
      // Special handling for waiver category
      if (categories[currentCategory] === 'WAIVER') {
        const waiverResponses = currentQuestions.map(question => ({
          question,
          value: getValueByPath(formData, question.field_key)
        }));

        const notAgreedWaivers = waiverResponses.filter(({ question, value }) => 
          value !== true
        );

        if (notAgreedWaivers.length > 0) {
          const missingWaivers = notAgreedWaivers.map(({ question }) => question.text).join('\n• ');
          setError(`You must agree to all terms to continue:\n• ${missingWaivers}`);
          return;
        }
      }

      // Rest of validation for other categories
      const missingFields = currentQuestions
        .filter(question => {
          if (question.validation?.required) {
            const value = getValueByPath(formData, question.field_key);
            return value === undefined || value === null || value === '';
          }
          return false;
        })
        .map(q => q.text);

      if (missingFields.length > 0) {
        setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Clear any existing errors since validation passed
      setError(null);

      // Update responses for current category
      const updatedResponses = [...responses];
      
      currentQuestions.forEach(question => {
        const value = getValueByPath(formData, question.field_key);
        if (value !== undefined && value !== null) {
          const existingIndex = updatedResponses.findIndex(r => r.question_id === question.id);
          const response = {
            question_id: question.id,
            answer: value
          };

          if (existingIndex !== -1) {
            // Update existing response
            updatedResponses[existingIndex] = response;
          } else {
            // Add new response
            updatedResponses.push(response);
          }
        }
      });

      // Update the responses state
      setResponses(updatedResponses);

      try {
        // Save responses to the database
        await questionsApi.saveResponses(updatedResponses);

        // Move to next step only if save was successful
        if (currentCategory === categories.length - 1) {
          setActiveStep(1);
        } else {
          setCurrentCategory(prev => prev + 1);
        }
      } catch (err: any) {
        console.error('Error saving responses:', err);
        setError(err?.message || 'Failed to save responses');
        // Don't navigate if save failed
        return;
      }
    } catch (err: any) {
      console.error('Error in form validation:', err);
      setError(err?.message || 'An error occurred while validating the form');
      // Don't navigate if there was an error
      return;
    }
  };

  // Helper function to get nested object value by path
  const getValueByPath = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const handleBack = () => {
    if (activeStep === 1) {
      setActiveStep(0);
    } else if (currentCategory > 0) {
      setCurrentCategory(prev => prev - 1);
    }
  };

  const handleFormSubmit = async (data: UserInfo) => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log('Form Data:', data);
      console.log('Responses:', responses);

      const mealPlan = await questionsApi.submitResponses(data, responses);
      navigate('/meal-plan', { state: { mealPlan } });
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const categories = Array.from(new Set(questions.map(q => q.category)));
  const currentQuestions = questions.filter(q => q.category === categories[currentCategory]);

  return (
    <Box>
      <Stepper 
        activeStep={activeStep === 1 ? categories.length : currentCategory} 
        sx={{ mb: 4 }}
      >
        {categories.map((category) => (
          <Step key={category}>
            <StepLabel>{category}</StepLabel>
          </Step>
        ))}
        <Step>
          <StepLabel>Review</StepLabel>
        </Step>
      </Stepper>

      {activeStep === 0 ? (
        <Box>
          <Typography variant="h5" gutterBottom>
            {categories[currentCategory]}
          </Typography>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: 2,
                '& .MuiAlert-message': {
                  maxHeight: '200px',
                  overflowY: 'auto'
                }
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}>
              {currentQuestions.map(question => (
                <Box key={question.id} mb={2}>
                  {question.text === "What is your full name?" ? (
                    <Controller
                      name={question.field_key}
                      control={control}
                      defaultValue=""
                      render={({ field }) => {
                        console.log('Rendering full name field:', {
                          field_key: question.field_key,
                          current_value: field.value,
                          existing_response: responses.find(r => r.question_id === question.id)?.answer
                        });
                        return (
                          <TextField
                            {...field}
                            fullWidth
                            label={question.text}
                            placeholder="What is your full name?"
                            margin="normal"
                            value={field.value || ''}
                            onChange={(e) => {
                              field.onChange(e);
                              updateResponses(question, e.target.value);
                            }}
                          />
                        );
                      }}
                    />
                  ) : (
                    renderQuestion(question)
                  )}
                </Box>
              ))}

              <Box mt={4} display="flex" justifyContent="space-between">
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={currentCategory === 0}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  {currentCategory === categories.length - 1 ? 'Save and Review' : 'Save and Continue'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>
      ) : (
        <ReviewStep
          userInfo={getValues() as UserInfo}
          responses={responses}
          questions={questions}
          onEdit={() => setActiveStep(0)}
          onSubmit={handleFormSubmit}
        />
      )}

      {isSubmitting && (
        <Box 
          position="fixed" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          sx={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}
        >
          <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography>Generating your personalized meal plan...</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default DynamicQuestionForm; 