import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event,
  Warning,
  Info,
  ThumbUp,
  ThumbDown,
  ExpandMore
} from '@mui/icons-material';
import EmpRMNav from '../../navbars/EmpRMNav';
import { getNotifications, markNotificationAsRead } from '../../api';
import { useToast } from '../../components/ToastProvider';

const NotificationsRM = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());
  const { showToast } = useToast();

  const dashboardName = 'Notifications RM';

  useEffect(() => {
    fetchNotifications();
    document.title = 'ICST | Notifications RM';
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      if (response.success && response.data) {
        if (response.data.length > notifications.length) {
          showToast('You have a new notification!', 'info');
        }
        setNotifications(response.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
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
      // Mark as read when expanded
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
        } catch {}
      }
    }
    setExpandedNotifications(newExpanded);
  };

  const getNotificationIcon = (type, metadata) => {
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
      case 'success':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getNotificationBackground = (read) => {
    return read ? 'transparent' : '#f8f9fa';
  };

  const getNotificationBorder = (read) => {
    return read ? 'none' : '2px solid #2196f3';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <EmpRMNav />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { sm: '10px' }
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#941936', mb: 4, textAlign: 'center' }}>
          Notifications RM
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
                You'll see notifications here when there are updates about your team's leave requests or your actions.
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification, index) => {
                const isExpanded = expandedNotifications.has(notification.id);
                const isUnread = !notification.read;
                return (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: getNotificationBackground(notification.read),
                        border: getNotificationBorder(notification.read),
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
                          bgcolor: notification.read ? '#e0e0e0' : 'linear-gradient(135deg, #a60515 0%, #941936 100%)',
                          border: isUnread ? '2px solid #a60515' : 'none'
                        }}>
                          {getNotificationIcon(notification.type, notification.metadata)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="subtitle1"
                              component="span"
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
                              sx={{ bgcolor: '#a60515', color: 'white', fontWeight: 600 }}
                            />
                            {isUnread && (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: '#2196f3',
                                  ml: 1
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box component="span">
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{
                                mb: 1,
                                color: notification.read ? 'text.secondary' : 'text.primary'
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="span">
                              {notification.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                      <IconButton
                        size="small"
                        sx={{
                          color: '#2196f3',
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
                          <Typography variant="body2" component="div" sx={{ mb: 2 }}>
                            {notification.message}
                          </Typography>
                          {notification.metadata && (
                            <Box sx={{ mt: 2 }}>
                              {notification.metadata.employee_name && (
                                <Typography variant="caption" display="block" color="text.secondary" component="div">
                                  Employee: {notification.metadata.employee_name}
                                </Typography>
                              )}
                              {notification.metadata.leave_type && (
                                <Typography variant="caption" display="block" color="text.secondary" component="div">
                                  Leave Type: {notification.metadata.leave_type}
                                </Typography>
                              )}
                              {notification.metadata.start_date && notification.metadata.end_date && (
                                <Typography variant="caption" display="block" color="text.secondary" component="div">
                                  Period: {new Date(notification.metadata.start_date).toLocaleDateString()} - {new Date(notification.metadata.end_date).toLocaleDateString()}
                                </Typography>
                              )}
                              {notification.metadata.days && (
                                <Typography variant="caption" display="block" color="text.secondary" component="div">
                                  Duration: {notification.metadata.days} day{notification.metadata.days > 1 ? 's' : ''}
                                </Typography>
                              )}
                              {notification.metadata.status && (
                                <Typography variant="caption" display="block" color="text.secondary" component="div">
                                  Status: {notification.metadata.status}
                                </Typography>
                              )}
                            </Box>
                          )}
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }} component="div">
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

export default NotificationsRM; 