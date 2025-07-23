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

  const dashboardName = 'Employee Dashboard';

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
      if (role === 'rm') {
        navigate('/employeerm');
        return;
      }

      setUser(userData);
      setEmployee(employeeData);
      setRoleName(role);
    };

    checkAuth();
    fetchData();
    window.addEventListener('storage', checkAuth);
    document.title = 'ICST | Employee Dashboard';
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

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <EmpNav />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#f8fafc',
          minHeight: '90vh',
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
              </Box>
            </Box>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 5 }} columns={5}>
            <Grid sx={{ display: 'flex', width: '20%' }}>
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
                      bgcolor: '#4caf50', 
                      width: 48, 
                      height: 48,
                      mr: 2
                    }}>
                      <CalendarToday />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {leaveStats.totalLeave || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Total Leave Days
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ display: 'flex', width: '20%' }}>
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
                      bgcolor: '#2196f3', 
                      width: 48, 
                      height: 48,
                      mr: 2
                    }}>
                      <CheckCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {leaveStats.usedLeave || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Used Leave Days
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ display: 'flex', width: '20%' }}>
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
                      bgcolor: '#ff9800', 
                      width: 48, 
                      height: 48,
                      mr: 2
                    }}>
                      <Schedule />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {leaveStats.pendingLeave || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Pending Requests
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ display: 'flex', width: '20%' }}>
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
                      bgcolor: '#f44336', 
                      width: 48, 
                      height: 48,
                      mr: 2
                    }}>
                      <Cancel />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {leaveStats.rejectedLeave || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Rejected Requests
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ display: 'flex', width: '20%' }}>
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
                      bgcolor: '#9c27b0', 
                      width: 48, 
                      height: 48,
                      mr: 2
                    }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {(leaveStats.totalLeave || 0) - (leaveStats.usedLeave || 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Remaining Days
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Leave Requests */}
          <Card sx={{ 
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ 
                  bgcolor: '#941936', 
                  width: 48, 
                  height: 48,
                  mr: 2
                }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    Recent Leave Requests
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Your recent leave applications and their status
                  </Typography>
                </Box>
              </Box>

              {leaveRequests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
                    No leave requests found
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/leave-apply')}
                    sx={{ 
                      bgcolor: '#941936',
                      '&:hover': { bgcolor: '#7a0f2b' }
                    }}
                  >
                    Apply for Leave
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Leave Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Start Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>End Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Days</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaveRequests.slice(0, 5).map((request) => (
                        <TableRow key={request.id || request.LeaveRequestID} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#64748b' }}>
                              #{request.id || request.LeaveRequestID}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {request.leaveType || request.LeaveType || request.LeaveTypeName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(request.startDate || request.StartDate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(request.endDate || request.EndDate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {(request.days !== undefined && request.days !== null)
                                ? request.days
                                : calculateDays(request.startDate || request.StartDate, request.endDate || request.EndDate)
                              } days
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusText(request.status || request.LeaveStatus)} 
                              color={getStatusColor(request.status || request.LeaveStatus)}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default Employee;
