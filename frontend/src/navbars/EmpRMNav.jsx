import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Event,
  Person,
  Notifications,
  Settings,
  Logout,
  Assignment,
  AccountCircle
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../api';

const EmpRMNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState({});
  const [employee, setEmployee] = useState({});
  const [roleName, setRoleName] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
      const role = employeeData?.role?.RoleName?.toLowerCase();

      if (!token) {
        navigate('/');
        return;
      }

      setUser(userData);
      setEmployee(employeeData);
      setRoleName(role);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [navigate]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('employee');
      setUser({});
      setEmployee({});
      setRoleName('');
      navigate('/');
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const navigationItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />, 
      path: '/employeerm'
    },
    {
      text: 'Leave Apply',
      icon: <Event />,
      path: '/leave-apply-rm'
    },
    {
      text: 'Leave Requests',
      icon: <Assignment />,
      path: '/leave-requests-rm'
    },
    {
      text: 'Notifications',
      icon: <Notifications />,
      path: '/notifications-rm'
    },
    {
      text: 'My Profile',
      icon: <Person />,
      path: '/profile-rm'
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/settings-rm'
    }
  ];

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Avatar sx={{ bgcolor: '#2196f3', width: 40, height: 40 }}>
          {employee?.FirstName?.charAt(0) || 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
            {employee?.FirstName} {employee?.LastName}
          </Typography>
          <Chip 
            label={'Reporting Manager'} 
            size="small" 
            sx={{ bgcolor: '#2196f3', color: 'white', fontSize: '0.7rem' }}
          />
        </Box>
      </Box>
      <List sx={{ pt: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: '#2196f3',
                  color: 'white',
                  '&:hover': { bgcolor: '#1769aa' },
                  '& .MuiListItemIcon-root': { color: 'white' }
                },
                '&:hover': { bgcolor: '#e3f2fd' }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : '#666', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ '& .MuiTypography-root': { fontWeight: location.pathname === item.path ? 600 : 400 } }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#2196f3', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Reporting Manager Portal
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" onClick={() => handleNavigation('/notifications-rm')}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={handleProfileMenuOpen}>
              <AccountCircle />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose}>
              <MenuItem onClick={() => { handleProfileMenuClose(); handleNavigation('/profile-rm'); }}>Profile</MenuItem>
              <MenuItem onClick={() => { handleProfileMenuClose(); handleNavigation('/settings-rm'); }}>Settings</MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleProfileMenuClose(); handleLogout(); }}>
                <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: 260 }, flexShrink: { sm: 0 } }} aria-label="sidebar">
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260 }
          }}
          open
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260 }
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default EmpRMNav; 