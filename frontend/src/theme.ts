import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h1: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      fontWeight: 600,
    },
    h2: {
      fontSize: 'clamp(1.8rem, 4vw, 3rem)',
      fontWeight: 600,
    },
    h3: {
      fontSize: 'clamp(1.6rem, 3vw, 2.5rem)',
      fontWeight: 600,
    },
    h4: {
      fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
      fontWeight: 600,
    },
    h5: {
      fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
      fontWeight: 600,
    },
    h6: {
      fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
      fontWeight: 600,
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          width: '100%',
          height: '100%',
          '@media (min-width: 1200px)': {
            maxWidth: '100%',
            paddingLeft: '2vw',
            paddingRight: '2vw',
          },
          '@media (max-width: 1199px)': {
            paddingLeft: '4vw',
            paddingRight: '4vw',
          },
          '@media (max-width: 768px)': {
            paddingLeft: '5vw',
            paddingRight: '5vw',
          },
        },
      },
    },
    MuiBox: {
      styleOverrides: {
        root: {
          '&[role="main"]': {
            width: '100%',
            minHeight: '100%',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default theme; 