import { Box, Typography, Button, Grid, Paper, Container, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalDiningIcon from '@mui/icons-material/LocalDining';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <RestaurantMenuIcon sx={{ fontSize: 40 }} />,
      title: 'Personalized Meal Plans',
      description: 'Get customized meal plans based on your preferences and goals'
    },
    {
      icon: <FitnessCenterIcon sx={{ fontSize: 40 }} />,
      title: 'Fitness Goals',
      description: 'Align your nutrition with your fitness objectives'
    },
    {
      icon: <LocalDiningIcon sx={{ fontSize: 40 }} />,
      title: 'Healthy Recipes',
      description: 'Access a variety of nutritious and delicious recipes'
    }
  ];

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100%',
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          background: 'black',
          color: 'white',
          py: { xs: 8, md: 12 },
          mb: 6,
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                Terry Bryan Meal Plan
                <br />
                SmartFuel Technology
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2,
                  opacity: 0.9
                }}
              >
                Get customized meal plans tailored to your goals and preferences
              </Typography>
              {user ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/questions')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Create Your Meal Plan
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Get Started Free
                </Button>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/hero-image.png" // Add your hero image
                alt="Healthy meal"
                sx={{
                  width: '35%',
                  maxWidth: 600,
                  height: '35%',
                  objectFit: 'cover',
                  display: 'block',
                  marginLeft: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  textAlign: 'center',
                  borderRadius: 4,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            bgcolor: 'background.paper',
            borderRadius: 4,
            mb: 6,
          }}
        >
          <Typography variant="h3" gutterBottom>
            Ready to Start Your Journey?
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            Join thousands of users who have transformed their eating habits with our personalized meal plans.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(user ? '/questions' : '/register')}
            sx={{ px: 6 }}
          >
            {user ? 'Create Your Plan' : 'Get Started Now'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 