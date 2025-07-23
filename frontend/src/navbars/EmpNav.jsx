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
  AccountCircle,
  CalendarToday
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getUnreadNotificationCount } from '../api';
import IcstLogo from '../assets/ICST.png';

const EmpNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState({});
  const [employee, setEmployee] = useState({});
  const [roleName, setRoleName] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication and role on component mount and when localStorage changes
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

      // Ensure this is for regular employees only
      if (role !== 'employee') {
        if (role === 'admin' || role === 'hr') {
          navigate('/overview');
        } else if (role === 'rm') {
          navigate('/employeerm');
        } else {
          navigate('/employee');
        }
        return;
      }

      setUser(userData);
      setEmployee(employeeData);
      setRoleName(role);
    };

    checkAuth();

    // Listen for storage changes (when user logs out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  useEffect(() => {
    // Fetch unread notification count
    const fetchUnreadCount = async () => {
      try {
        const response = await getUnreadNotificationCount();
        if (response.success) {
          setUnreadCount(response.data.count);
        }
      } catch (error) {
        console.error('Error fetching unread notification count:', error);
      }
    };

    fetchUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    setIsLoggingOut(true);
    
    try {
      // Call centralized logout function
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('employee');
      
      // Reset state
      setUser({});
      setEmployee({});
      setRoleName('');
      
      // Navigate to login
      navigate('/');
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Navigation items for regular employees
  const navigationItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/employee'
    },
    {
      text: 'Leave Apply',
      icon: <Event />,
      path: '/leave-apply'
    },
    {
      text: 'Notifications',
      icon: <Notifications />,
      path: '/notifications'
    },
    {
      text: 'Leave Calendar',
      icon: <CalendarToday />,
      path: '/calendar'
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/settings'
    }
  ];

  const drawer = (
    <Box>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        borderBottom: '1px solid #e0e0e0',
        mb: 2
      }}>
        <img 
          src={IcstLogo} 
          alt="ICST Logo" 
          style={{ 
            width: '80%',
            height: 'auto',
            marginBottom: '1rem'
          }} 
        />
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
                  bgcolor: '#941936',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#7a0f2b'
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white'
                  }
                },
                '&:hover': {
                  bgcolor: '#f5f5f5'
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? 'white' : '#666',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': {
                    fontWeight: location.pathname === item.path ? 600 : 400
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'rgba(183, 24, 69, 0.9)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          ml: { sm: '20px' },
          width: { sm: `calc(100% - 250px)` }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              color="inherit"
              onClick={() => handleNavigation('/notifications')}
            >
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                onClick={handleProfileMenuOpen}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                {employee?.FirstName?.charAt(0) || 'U'}
              </Avatar>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'white',
                  fontWeight: 500,
                  display: { xs: 'none', sm: 'block' },
                  cursor: 'pointer'
                }}
                onClick={handleProfileMenuOpen}
              >
                {employee?.FirstName} {employee?.LastName}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: 250 }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 250,
              bgcolor: '#fff'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 250,
              bgcolor: '#fff',
              borderRight: '1px solid #e0e0e0'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        }}
      >

        <MenuItem onClick={() => { handleNavigation('/settings'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default EmpNav; 