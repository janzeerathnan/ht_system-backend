import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Avatar,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Person,
  Event,
  Assignment,
  Notifications,
  Add,
  Visibility,
  CheckCircle,
  Cancel,
  Schedule,
  TrendingUp,
  CalendarToday,
  WorkOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EmpNav from '../../navbars/EmpNav';
import { getEmployeeLeaveStats, getEmployeeLeaveHistory } from '../../api';

const Employee = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [employee, setEmployee] = useState({});
  const [roleName, setRoleName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [leaveStats, setLeaveStats] = useState({
    totalLeave: 0,
    usedLeave: 0,
    acceptedLeave: 0,
    rejectedLeave: 0,
    pendingLeave: 0
  });

  const [leaveRequests, setLeaveRequests] = useState([]);

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
    fetchData();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, historyRes] = await Promise.all([
        getEmployeeLeaveStats(),
        getEmployeeLeaveHistory()
      ]);

      if (statsRes.success) {
        setLeaveStats(statsRes.data);
      }

      if (historyRes.success) {
        setLeaveRequests(historyRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const [upcomingHolidays, setUpcomingHolidays] = useState([
    {
      id: 1,
      holidayName: 'New Year\'s Day',
      holidayDate: '2025-01-01',
      holidayType: 'Public Holiday',
      description: 'New Year celebration'
    },
    {
      id: 2,
      holidayName: 'Company Annual Dinner',
      holidayDate: '2025-12-20',
      holidayType: 'Company Holiday',
      description: 'Annual company celebration'
    },
    {
      id: 3,
      holidayName: 'Christmas Day',
      holidayDate: '2025-12-25',
      holidayType: 'Public Holiday',
      description: 'Christmas celebration'
    },
    {
      id: 4,
      holidayName: 'Team Building Day',
      holidayDate: '2025-08-15',
      holidayType: 'Company Holiday',
      description: 'Team building activities'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <EmpNav />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
          pt: 8,
          pl: { sm: '10px' }
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ 
                bgcolor: '#941936', 
                width: 56, 
                height: 56,
                fontSize: '1.5rem',
                fontWeight: 600
              }}>
                {employee?.FirstName?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700, 
                  color: '#1e293b',
                  fontSize: { xs: '1.8rem', md: '2.2rem' }
                }}>
                  Welcome back, {employee?.FirstName} {employee?.LastName}!
                </Typography>
                <Typography variant="div" sx={{ 
                  color: '#64748b',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Chip 
                    label={roleName === 'rm' ? 'Reporting Manager' : 'Employee'} 
                    size="small" 
                    sx={{ 
                      bgcolor: roleName === 'rm' ? '#2196f3' : '#4caf50',
                      color: 'white', 
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}
                  />
                  Here's an overview of your leave management
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 5 }}>
            <Grid sx={{ display: 'flex', width: { xs: '100%', sm: '50%', md: '25%', lg: '20%' } }}>
              <Card sx={{ 
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                width: '100%',
                '&:hover': { 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: '#3b82f6', 
                      width: 48, 
                      height: 48,
                      mr: 2
                    }}>
                      <Event sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ 
                        color: '#1e293b', 
                        fontWeight: 700,
                        fontSize: '2rem'
                      }}>
                        {leaveStats.totalLeave}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        fontWeight: 500
                      }}>
                        Total Leave Days
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ display: 'flex', width: { xs: '100%', sm: '50%', md: '25%', lg: '20%' } }}>
              <Card sx={{ 
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                width: '100%',
                '&:hover': { 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: '#f59e0b', 
                      width: 48, 
                      height: 48,
                      mr: 2
                    }}>
                      <WorkOutline sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ 
                        color: '#1e293b', 
                        fontWeight: 700,
                        fontSize: '2rem'
                      }}>
                        {leaveStats.usedLeave}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        fontWeight: 500
                      }}>
                        Used Leave Days
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ display: 'flex', width: { xs: '100%', sm: '50%', md: '25%', lg: '20%' } }}>
              <Card sx={{ 
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                width: '100%',
                '&:hover': { 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: '#10b981', 
                      width: 48, 
                      height: 48,
                      mr: 2
                    }}>
                      <CheckCircle sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ 
                        color: '#1e293b', 
                        fontWeight: 700,
                        fontSize: '2rem'
                      }}>
                        {leaveStats.acceptedLeave}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        fontWeight: 500
                      }}>
                        Approved Requests
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ display: 'flex', width: { xs: '100%', sm: '50%', md: '25%', lg: '20%' } }}>
              <Card sx={{ 
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                width: '100%',
                '&:hover': { 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: '#ef4444', 
                      width: 48, 
                      height: 48,
                      mr: 2
                    }}>
                      <Cancel sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ 
                        color: '#1e293b', 
                        fontWeight: 700,
                        fontSize: '2rem'
                      }}>
                        {leaveStats.rejectedLeave}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        fontWeight: 500
                      }}>
                        Rejected Requests
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ display: 'flex', width: { xs: '100%', sm: '50%', md: '25%', lg: '20%' } }}>
              <Card sx={{ 
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                width: '100%',
                '&:hover': { 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: '#8b5cf6', 
                      width: 48, 
                      height: 48,
                      mr: 2
                    }}>
                      <Schedule sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ 
                        color: '#1e293b', 
                        fontWeight: 700,
                        fontSize: '2rem'
                      }}>
                        {leaveStats.pendingLeave}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        fontWeight: 500
                      }}>
                        Pending Requests
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Apply Leave Button */}
          <Box sx={{ mb: 5 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              onClick={() => navigate('/leave-apply')}
              sx={{
                bgcolor: '#3b82f6',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.3 rem',
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                '&:hover': { 
                  bgcolor: '#2563eb',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Apply for Leave
            </Button>
          </Box>

          {/* Main Content */}
          <Grid container spacing={4}>
            {/* Leave Requests Table */}
            <Grid sx={{ width: { xs: '100%', lg: '66.67%' } }}>
              <Card sx={{ 
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                height: 'fit-content'
              }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="h5" sx={{ 
                    color: '#1e293b', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Assignment sx={{ color: '#3b82f6' }} />
                    Leave Request History
                  </Typography>
                </Box>
                {leaveRequests.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
                      No leave requests found
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => navigate('/leave-apply')}
                      sx={{ color: '#3b82f6', borderColor: '#3b82f6' }}
                    >
                      Apply for Leave
                    </Button>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Leave Type</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Start Date</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#374151' }}>End Date</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Days</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Reason</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Submitted</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {leaveRequests.map((request) => (
                          <TableRow key={request.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {request.leaveType}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: '#374151' }}>
                                {new Date(request.startDate).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: '#374151' }}>
                                {new Date(request.endDate).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${request.days} days`}
                                size="small"
                                sx={{ 
                                  bgcolor: '#e0f2fe',
                                  color: '#0369a1',
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ 
                                color: '#374151',
                                maxWidth: 150,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {request.reason}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusText(request.status)}
                                color={getStatusColor(request.status)}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                {new Date(request.submittedDate).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small" 
                                  sx={{ 
                                    color: '#3b82f6',
                                    '&:hover': { bgcolor: '#dbeafe' }
                                  }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            </Grid>

            {/* Upcoming Holidays */}
            <Grid sx={{ width: { xs: '100%', lg: '33.33%' } }}>
              <Card sx={{ 
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                height: 'fit-content'
              }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                  <Typography variant="h5" sx={{ 
                    color: '#1e293b', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <CalendarToday sx={{ color: '#3b82f6' }} />
                    Upcoming Holidays
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  {upcomingHolidays.map((holiday, index) => (
                    <Box key={holiday.id}>
                      <Box sx={{ 
                        p: 2.5, 
                        mb: 2, 
                        borderRadius: 2,
                        backgroundColor: holiday.holidayType === 'Public Holiday' ? '#fef3c7' : '#dbeafe',
                        border: holiday.holidayType === 'Public Holiday' ? '1px solid #fde68a' : '1px solid #93c5fd'
                      }}>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 700, 
                          color: '#1e293b',
                          mb: 1
                        }}>
                          {holiday.holidayName}
                        </Typography>
                        <Chip 
                          label={holiday.holidayType}
                          size="small"
                          sx={{ 
                            bgcolor: holiday.holidayType === 'Public Holiday' ? '#f59e0b' : '#3b82f6',
                            color: 'white',
                            fontWeight: 600,
                            mb: 1
                          }}
                        />
                        <Typography variant="body2" sx={{ 
                          color: '#64748b',
                          fontWeight: 500,
                          mb: 0.5
                        }}>
                          {new Date(holiday.holidayDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#64748b',
                          fontStyle: 'italic'
                        }}>
                          {holiday.description}
                        </Typography>
                      </Box>
                      {index < upcomingHolidays.length - 1 && (
                        <Divider sx={{ my: 2 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Employee;
