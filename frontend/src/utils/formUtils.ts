import { Question, QuestionResponse } from '../types';

export const setNestedValue = (obj: any, path: string, value: any) => {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return obj;
};

export const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

export const mapResponsesToFormData = (questions: Question[], responses: QuestionResponse[]) => {
  const formData: any = {};
  
  responses.forEach(response => {
    const question = questions.find(q => q.id === response.question_id);
    if (question && question.field_key) {
      setNestedValue(formData, question.field_key, response.answer);
    }
  });
  
  return formData;
};

export const mapFormDataToResponses = (questions: Question[], formData: any): QuestionResponse[] => {
  return questions
    .filter(question => question.field_key)
    .map(question => ({
      question_id: question.id,
      answer: getNestedValue(formData, question.field_key) || ''
    }))
    .filter(response => response.answer !== '');
};

export const validateFormData = (questions: Question[], formData: any) => {
  const errors: { [key: string]: string } = {};
  
  questions.forEach(question => {
    if (!question.field_key) return;
    
    const value = getNestedValue(formData, question.field_key);
    const validation = question.validation;
    
    if (validation?.required && (!value || value.toString().trim() === '')) {
      errors[question.field_key] = 'This field is required';
    } else if (value && validation) {
      if (question.question_type === 'number') {
        const numValue = Number(value);
        if (validation.min !== undefined && numValue < validation.min) {
          errors[question.field_key] = `Value must be at least ${validation.min}`;
        }
        if (validation.max !== undefined && numValue > validation.max) {
          errors[question.field_key] = `Value must be at most ${validation.max}`;
        }
      }
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        errors[question.field_key] = 'Invalid format';
      }
      if (validation.minSelect && Array.isArray(value) && value.length < validation.minSelect) {
        errors[question.field_key] = `Please select at least ${validation.minSelect} options`;
      }
    }
  });
  
  return errors;
}; 