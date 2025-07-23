import React, { useState, useEffect, useCallback } from 'react';
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
  Avatar,
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Person,
  CheckCircle,
  Cancel,
  Schedule,
  TrendingUp,
  CalendarToday
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EmpRMNav from '../../navbars/EmpRMNav';
import { getEmployeeLeaveStats, getEmployeeLeaveHistory } from '../../api';
import { useToast } from '../../components/ToastProvider';

const EmployeeRM = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [employee, setEmployee] = useState({});
  const [roleName, setRoleName] = useState('');
  const [loading, setLoading] = useState(true);

  const [leaveStats, setLeaveStats] = useState({
    totalLeave: 0,
    acceptedLeave: 0,
    pendingLeave: 0,
    rejectedLeave: 0
  });
  const [leaveHistory, setLeaveHistory] = useState([]);

  const { showToast } = useToast();

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');

    if (!token) {
      window.location.href = '/';
      return;
    }

    setEmployee(employeeData);
  }, []);

  useEffect(() => {
    checkAuth();
    fetchStatsAndHistory();
    document.title = 'ICST | Employee RM Dashboard';
  }, [checkAuth]);

  const fetchStatsAndHistory = async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes] = await Promise.all([
        getEmployeeLeaveStats(),
        getEmployeeLeaveHistory()
      ]);

      if (statsRes.success) setLeaveStats(statsRes.data);
      if (historyRes.success) setLeaveHistory(historyRes.data);
    } catch (error) {
      showToast('Failed to load dashboard data. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const dashboardName = 'Employee RM Dashboard';

  return (
    <Box sx={{ display: 'flex' }}>
      <EmpRMNav />
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
                bgcolor: 'linear-gradient(135deg, #a60515 0%, #941936 100%)',
                width: 56, 
                height: 56,
                fontSize: '1.5rem',
                fontWeight: 600
              }}>
                {employee?.FirstName?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                  Welcome, {employee?.FirstName} {employee?.LastName}
                </Typography>
                <Typography variant="div" sx={{ color: '#64748b', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Reporting Manager" size="small" sx={{ bgcolor: '#a60515', color: 'white', fontSize: '0.7rem', fontWeight: 600 }} />
                  Here is your leave overview
                </Typography>
              </Box>
            </Box>
          </Box>
          {/* RM's Own Leave Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
              <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 3px rgba(166,5,21,0.15)', border: '2px solid #a60515', width: '100%' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#a60515', width: 48, height: 48, mb: 1 }}><TrendingUp /></Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>{leaveStats.totalLeave}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Total Leave</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
              <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 3px rgba(166,5,21,0.15)', border: '2px solid #a60515', width: '100%' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#a60515', width: 48, height: 48, mb: 1 }}><CheckCircle /></Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>{leaveStats.acceptedLeave}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Accepted</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
              <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 3px rgba(166,5,21,0.15)', border: '2px solid #a60515', width: '100%' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#a60515', width: 48, height: 48, mb: 1 }}><Schedule /></Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>{leaveStats.pendingLeave}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Pending</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
              <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 3px rgba(166,5,21,0.15)', border: '2px solid #a60515', width: '100%' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#a60515', width: 48, height: 48, mb: 1 }}><Cancel /></Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>{leaveStats.rejectedLeave}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Rejected</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {/* RM's Own Leave History Table */}
          <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 3px rgba(166,5,21,0.15)', border: '2px solid #a60515' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: '#a60515', width: 48, height: 48, mr: 2 }}><Person /></Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    My Leave History
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Your recent leave applications and their status
                  </Typography>
                </Box>
              </Box>
              {leaveHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
                    No leave requests found
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/leave-apply-rm')}
                    sx={{ bgcolor: '#a60515', '&:hover': { bgcolor: '#941936' } }}
                  >
                    Apply for Leave
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Leave Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Start Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>End Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Days</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaveHistory.map((request, idx) => (
                        <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {request.leaveType}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(request.startDate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(request.endDate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {request.days} days
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusText(request.status)}
                              color={getStatusColor(request.status)}
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

export default EmployeeRM;
