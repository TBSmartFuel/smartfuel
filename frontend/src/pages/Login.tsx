import { Box, Typography, Paper, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

const Login = () => {
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
            bgcolor: '#2196f3',
            color: 'white',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <RestaurantMenuIcon sx={{ fontSize: 48, mb: 2, color: 'white' }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Meal Planner
          </Typography>
          <Typography variant="subtitle1">
            Get personalized meal plans tailored to your goals and preferences.
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
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Sign in to continue
            </Typography>

            <LoginForm />

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: '#2196f3',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login; 