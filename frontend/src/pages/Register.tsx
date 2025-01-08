import { Box, Typography, Paper, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const Register = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #2196f3 0%, #9c27b0 100%)',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1000,
          margin: 'auto',
          display: 'flex',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        {/* Left Panel */}
        <Box
          sx={{
            flex: 1,
            bgcolor: '#9c27b0',
            color: 'white',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <FitnessCenterIcon sx={{ fontSize: 48, mb: 2, color: 'white' }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Start Your Journey
          </Typography>
          <Typography variant="subtitle1">
            Create your account and get personalized meal plans that match your fitness goals.
          </Typography>
        </Box>

        {/* Right Panel */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
            bgcolor: 'white',
          }}
        >
          <Box sx={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Get started with your free account
            </Typography>

            <RegisterForm />

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: '#2196f3',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Register; 