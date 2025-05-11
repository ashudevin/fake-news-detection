import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FactCheckIcon from '@mui/icons-material/FactCheck';

const navItems = [
  { title: 'Home', path: '/' },
  { title: 'Analyzer', path: '/analyzer' },
  { title: 'Reports', path: '/reports' },
  { title: 'Dashboard', path: '/dashboard' },
  { title: 'About', path: '/about' },
];

function Navbar() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FactCheckIcon sx={{ mr: 1 }} />
        Fake News Detector
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.title} 
            component={RouterLink} 
            to={item.path}
            selected={location.pathname === item.path}
            sx={{ 
              textAlign: 'center',
              color: 'inherit',
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                color: 'primary.main',
              }
            }}
          >
            <ListItemText primary={item.title} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              alignItems: 'center',
            }}
          >
            <FactCheckIcon sx={{ mr: 1 }} />
            Fake News Detector
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                component={RouterLink}
                to="/"
                sx={{
                  flexGrow: 1,
                  fontWeight: 700,
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FactCheckIcon sx={{ mr: 1 }} />
                Fake News Detector
              </Typography>
            </>
          ) : (
            <>
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                {navItems.map((item) => (
                  <Button
                    key={item.title}
                    component={RouterLink}
                    to={item.path}
                    sx={{ 
                      my: 2, 
                      color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                      fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                      display: 'block',
                    }}
                  >
                    {item.title}
                  </Button>
                ))}
              </Box>
            </>
          )}
        </Toolbar>
      </Container>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}

export default Navbar;