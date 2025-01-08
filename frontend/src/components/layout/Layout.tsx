import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  Link,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';

interface LayoutProps {
  children: React.ReactNode;
}

const HEADER_HEIGHT = '110px';
const HEADER_BG_COLOR = '#017ABB';

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}
    >
      <AppBar 
        position="fixed" 
        elevation={1}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          height: HEADER_HEIGHT,
          bgcolor: HEADER_BG_COLOR,
        }}
      >
        <Toolbar
          sx={{
            height: HEADER_HEIGHT,
            minHeight: HEADER_HEIGHT,
            px: { xs: 2, sm: 4 },
          }}
        >
          <RouterLink to="/">
            <Box
              component="img"
              src="/TBlogo.png"
              alt="Terry Bryan Fitness Logo"
              sx={{
                height: '80px',
                width: 'auto',
                mr: 2,
                objectFit: 'contain',
                cursor: 'pointer'
              }}
            />
          </RouterLink>
          <Typography 
            variant="h1" 
            component={RouterLink} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold',
              fontSize: '3rem',
            }}
          >
            SmartFuel
          </Typography>
          
          {user ? (
            <>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/questions"
                  startIcon={<DashboardIcon />}
                >
                  Generate Plan
                </Button>
                {user.is_admin && (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin"
                    startIcon={<DashboardIcon />}
                  >
                    Admin
                  </Button>
                )}
                <IconButton
                  onClick={handleMenuOpen}
                  color="inherit"
                  edge="end"
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                    {user.email[0].toUpperCase()}
                  </Avatar>
                </IconButton>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="textSecondary">
                    {user.email}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem component={RouterLink} to="/meal-plan">
                  My Meal Plans
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                variant="outlined"
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="secondary"
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          mt: HEADER_HEIGHT,
          minHeight: `calc(100vh - ${HEADER_HEIGHT})`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
          width: '100%',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Terry Bryan Fitness | 7791 Montgomery Road Kenwood, Ohio 45236 |{' '}
            <Link
              href="https://www.terrybryanfitness.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              www.terrybryanfitness.com
            </Link>
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 