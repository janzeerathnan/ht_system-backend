import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event,
  CheckCircle,
  Warning,
  Info,
  Delete
} from '@mui/icons-material';
import EmpNav from '../../navbars/EmpNav';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Simulate fetching notifications
    const mockNotifications = [
      {
        id: 1,
        type: 'leave',
        title: 'Leave Application Approved',
        message: 'Your annual leave request for Dec 25-27 has been approved by your manager.',
        timestamp: '2 hours ago',
        read: false,
        priority: 'high'
      },
      {
        id: 2,
        type: 'reminder',
        title: 'Timesheet Due',
        message: 'Please submit your timesheet for this week by Friday.',
        timestamp: '1 day ago',
        read: false,
        priority: 'medium'
      },
      {
        id: 3,
        type: 'info',
        title: 'Company Holiday',
        message: 'Office will be closed on December 25th for Christmas.',
        timestamp: '2 days ago',
        read: true,
        priority: 'low'
      },
      {
        id: 4,
        type: 'leave',
        title: 'Leave Application Pending',
        message: 'Your sick leave request is pending approval.',
        timestamp: '3 days ago',
        read: true,
        priority: 'medium'
      },
      {
        id: 5,
        type: 'reminder',
        title: 'Performance Review',
        message: 'Your annual performance review is scheduled for next week.',
        timestamp: '1 week ago',
        read: true,
        priority: 'high'
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave':
        return <Event color="primary" />;
      case 'reminder':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredNotifications = tabValue === 0 
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.read);

  return (
    <Box sx={{ display: 'flex' }}>
      <EmpNav />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { sm: '10px' }
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: '#333', mb: 3 }}>
          Notifications
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label={
                <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                  Unread
                </Badge>
              } 
            />
            <Tab label="Read" />
          </Tabs>
        </Paper>

        <Paper>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                {tabValue === 0 ? 'No unread notifications' : 'No read notifications'}
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.read ? 'transparent' : '#f8f9fa',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: notification.read ? '#e0e0e0' : '#941936' }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: notification.read ? 400 : 600,
                              color: notification.read ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip 
                            label={notification.priority} 
                            size="small" 
                            color={getPriorityColor(notification.priority)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.timestamp}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!notification.read && (
                        <IconButton 
                          size="small" 
                          onClick={() => markAsRead(notification.id)}
                          sx={{ color: '#941936' }}
                        >
                          <CheckCircle />
                        </IconButton>
                      )}
                      <IconButton 
                        size="small" 
                        onClick={() => deleteNotification(notification.id)}
                        sx={{ color: '#f44336' }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Notifications; 