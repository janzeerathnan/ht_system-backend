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
  Collapse,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event,
  CheckCircle,
  Warning,
  Info,
  ThumbUp,
  ThumbDown,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import EmpNav from '../../navbars/EmpNav';
import { getNotifications, markNotificationAsRead } from '../../api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());

  useEffect(() => {
    fetchNotifications();
    document.title = 'ICST | Notifications';

    // Poll every 10 seconds for new notifications
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      
      // Add logging to debug notification structure
      console.log('Fetched notifications:', response.data);
      if (response.success && response.data) {
        setNotifications(response.data);
      } else {
        console.error('Failed to fetch notifications:', response.message);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandNotification = async (notificationId) => {
    const newExpanded = new Set(expandedNotifications);
    
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
      
      // Mark notification as read when expanded
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        try {
          const response = await markNotificationAsRead(notificationId);
          if (response.success) {
            setNotifications(prev => 
              prev.map(notif => 
                notif.id === notificationId ? { ...notif, read: true } : notif
              )
            );
          }
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      }
    }
    
    setExpandedNotifications(newExpanded);
  };

  const getNotificationIcon = (type, metadata) => {
    // Check if it's a leave notification with status
    if (type === 'leave' && metadata?.status) {
      switch (metadata.status) {
        case 'approved':
          return <ThumbUp color="success" />;
        case 'rejected':
          return <ThumbDown color="error" />;
        case 'pending':
          return <Event color="warning" />;
        default:
          return <Event color="primary" />;
      }
    }
    
    // Fallback to type-based icons
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

  const getNotificationBackground = (read) => {
    return read ? 'transparent' : '#f8f9fa';
  };

  const getNotificationBorder = (read) => {
    return read ? 'none' : '2px solid #941936';
  };

  const dashboardName = 'Notifications';

  return (
    <Box sx={{ display: 'flex' }}>
      <EmpNav />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { sm: '20px' }
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#941936', mb: 4, textAlign: 'center' }}>
          Notifications
        </Typography>

        <Paper>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                Loading notifications...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No notifications
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                You'll see notifications here when there are updates about your leave requests or other important information.
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification, index) => {
                // Defensive check: skip if notification is malformed
                if (!notification || !notification.type) return null;
                // Defensive check: ensure leave notifications have metadata and status
                if (notification.type === 'leave' && (!notification.metadata || !notification.metadata.status)) {
                  console.warn('Leave notification missing metadata or status:', notification);
                  return null;
                }
                const isExpanded = expandedNotifications.has(notification.id);
                const isUnread = !notification.read;

                // Custom title and message for leave notifications
                let displayTitle = notification.title;
                let displayMessage = notification.message;
                let highlight = false;
                if (notification.type === 'leave' && notification.metadata) {
                  const { status, leave_type, start_date, end_date, days } = notification.metadata;
                  if (status === 'approved') {
                    displayTitle = 'Leave Request Approved';
                    displayMessage = `Your ${leave_type || ''} leave request from ${start_date ? new Date(start_date).toLocaleDateString() : ''} to ${end_date ? new Date(end_date).toLocaleDateString() : ''} (${days || ''} day${days > 1 ? 's' : ''}) has been approved.`;
                    highlight = true;
                  } else if (status === 'rejected') {
                    displayTitle = 'Leave Request Rejected';
                    displayMessage = `Your ${leave_type || ''} leave request from ${start_date ? new Date(start_date).toLocaleDateString() : ''} to ${end_date ? new Date(end_date).toLocaleDateString() : ''} (${days || ''} day${days > 1 ? 's' : ''}) has been rejected.`;
                    highlight = true;
                  } else if (status === 'pending') {
                    displayTitle = 'Leave Request Pending';
                    displayMessage = `Your ${leave_type || ''} leave request from ${start_date ? new Date(start_date).toLocaleDateString() : ''} to ${end_date ? new Date(end_date).toLocaleDateString() : ''} (${days || ''} day${days > 1 ? 's' : ''}) is pending approval.`;
                  }
                }

                return (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: highlight ? (notification.read ? '#e8f5e9' : '#fff3e0') : getNotificationBackground(notification.read),
                        border: highlight ? (notification.read ? '2px solid #388e3c' : '2px solid #d32f2f') : getNotificationBorder(notification.read),
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: isUnread ? '#f0f0f0' : '#f5f5f5',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handleExpandNotification(notification.id)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{
                          bgcolor: notification.read ? '#e0e0e0' : '#941936',
                          border: isUnread ? '2px solid #941936' : 'none'
                        }}>
                          {getNotificationIcon(notification.type, notification.metadata)}
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
                              {displayTitle}
                            </Typography>
                            <Chip
                              label={notification.priority}
                              size="small"
                              color={getPriorityColor(notification.priority)}
                            />
                            {isUnread && (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: '#941936',
                                  ml: 1
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                mb: 1,
                                color: notification.read ? 'text.secondary' : 'text.primary'
                              }}
                            >
                              {displayMessage}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {notification.timestamp}
                            </Typography>
                          </Box>
                        }
                      />

                      <IconButton
                        size="small"
                        sx={{
                          color: '#941936',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      >
                        <ExpandMore />
                      </IconButton>
                    </ListItem>

                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box sx={{ pl: 7, pr: 3, pb: 2 }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            bgcolor: '#fafafa',
                            borderColor: '#e0e0e0'
                          }}
                        >
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {displayMessage}
                          </Typography>

                          {notification.metadata && (
                            <Box sx={{ mt: 2 }}>
                              {notification.metadata.leave_type && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Leave Type: {notification.metadata.leave_type}
                                </Typography>
                              )}
                              {notification.metadata.start_date && notification.metadata.end_date && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Period: {new Date(notification.metadata.start_date).toLocaleDateString()} - {new Date(notification.metadata.end_date).toLocaleDateString()}
                                </Typography>
                              )}
                              {notification.metadata.days && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Duration: {notification.metadata.days} day{notification.metadata.days > 1 ? 's' : ''}
                                </Typography>
                              )}
                              {notification.metadata.status && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Status: {notification.metadata.status.charAt(0).toUpperCase() + notification.metadata.status.slice(1)}
                                </Typography>
                              )}
                            </Box>
                          )}

                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
                            {notification.read ? 'Read' : 'Unread'} • {notification.timestamp}
                          </Typography>
                        </Paper>
                      </Box>
                    </Collapse>

                    {index < notifications.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Notifications; 