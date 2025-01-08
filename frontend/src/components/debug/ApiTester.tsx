import { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { questionsApi } from '../../services/api';

export const ApiTester = () => {
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    try {
      setResult('Testing connection...');
      const questions = await questionsApi.getQuestions();
      setResult(`Success! Found ${questions.length} questions`);
      console.log('Test successful:', questions);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
      console.error('Test failed:', error);
    }
  };

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6">API Connection Tester</Typography>
      <Button onClick={testConnection} variant="contained" sx={{ my: 1 }}>
        Test Questions API
      </Button>
      <Box sx={{ mt: 1 }}>
        <Typography>{result}</Typography>
      </Box>
    </Paper>
  );
}; 