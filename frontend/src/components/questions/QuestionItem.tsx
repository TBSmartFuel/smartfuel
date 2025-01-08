import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Paper,
  FormControl,
  FormHelperText,
  Checkbox,
  FormGroup,
  FormLabel,
  Slider,
  Switch,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Question, QuestionType } from '../../types';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface QuestionItemProps {
  question: Question;
  onAnswer: (answer: string | string[]) => void;
  value: string;
  error?: string;
  parentValue?: string;
}

const QuestionItem = ({ question, onAnswer, value, error, parentValue }: QuestionItemProps) => {
  // Don't render sub-questions if parent is not true
  if (question.parent_id && parentValue !== 'true') {
    return null;
  }

  const getValidationText = () => {
    const validation = question.validation;
    if (!validation) return '';

    const rules = [];
    if (validation.required) rules.push('Required');
    if (validation.min !== undefined) rules.push(`Min: ${validation.min}`);
    if (validation.max !== undefined) rules.push(`Max: ${validation.max}`);
    if (validation.minSelect !== undefined) rules.push(`Select at least: ${validation.minSelect}`);
    if (validation.pattern) rules.push('Must match pattern');

    return rules.join(' • ');
  };

  const renderAnswerInput = () => {
    switch (question.question_type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.RADIO:
        return (
          <FormControl error={!!error} fullWidth>
            <FormLabel>{question.text}</FormLabel>
            <RadioGroup
              value={value}
              onChange={(e) => onAnswer(e.target.value)}
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
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case QuestionType.CHECKBOX:
        const selectedValues = value ? value.split(',') : [];
        return (
          <FormControl error={!!error} fullWidth>
            <FormLabel>{question.text}</FormLabel>
            <FormGroup>
              {question.options?.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={selectedValues.includes(option)}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...selectedValues, option]
                          : selectedValues.filter(v => v !== option);
                        onAnswer(newValues);
                      }}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case QuestionType.NUMBER:
        return (
          <TextField
            type="number"
            fullWidth
            value={value}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder={`Enter a number${question.validation?.min !== undefined ? ` (min: ${question.validation.min})` : ''}`}
            error={!!error}
            helperText={error}
            inputProps={{
              min: question.validation?.min,
              max: question.validation?.max,
              step: 1
            }}
          />
        );

      case QuestionType.SLIDER:
        return (
          <Box sx={{ px: 2, py: 1 }}>
            <FormControl error={!!error} fullWidth>
              <FormLabel>{question.text}</FormLabel>
              <Slider
                value={Number(value) || question.validation?.min || 0}
                onChange={(_, newValue) => onAnswer(newValue.toString())}
                min={question.validation?.min || 0}
                max={question.validation?.max || 10}
                marks
                valueLabelDisplay="auto"
              />
              {error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
          </Box>
        );

      case QuestionType.BOOLEAN:
        return (
          <FormControl error={!!error} fullWidth>
            <FormControlLabel
              control={
                <Switch
                  checked={value === 'true'}
                  onChange={(e) => onAnswer(e.target.checked.toString())}
                />
              }
              label={question.text}
            />
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case QuestionType.TEXT:
      default:
        return (
          <TextField
            fullWidth
            multiline
            rows={2}
            value={value}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Enter your answer"
            error={!!error}
            helperText={error}
          />
        );
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      {question.question_type !== QuestionType.BOOLEAN && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            {question.text}
            {question.validation?.required && (
              <Typography 
                component="span" 
                color="error" 
                sx={{ ml: 1 }}
              >
                *
              </Typography>
            )}
          </Typography>
          {getValidationText() && (
            <Tooltip title={getValidationText()}>
              <IconButton size="small" sx={{ ml: 1 }}>
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
      <Box sx={{ mt: 2 }}>
        {renderAnswerInput()}
      </Box>
      {question.sub_questions && value === 'true' && (
        <Box sx={{ mt: 2, ml: 4 }}>
          {question.sub_questions.map((subQuestion: Question) => (
            <QuestionItem
              key={subQuestion.id}
              question={subQuestion}
              value={value}
              error={error}
              onAnswer={onAnswer}
              parentValue={value}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default QuestionItem; 