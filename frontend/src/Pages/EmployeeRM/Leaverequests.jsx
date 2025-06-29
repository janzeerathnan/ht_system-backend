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
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
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
  WorkOutline,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import EmpRMNav from '../../navbars/EmpRMNav';
import { getTeamLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from '../../api';

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', requestId: null, reason: '' });

  useEffect(() => {
    fetchTeamLeaveRequests();
  }, []);

  const fetchTeamLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await getTeamLeaveRequests();
      
      if (response.success) {
        setLeaveRequests(response.data);
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to fetch team leave requests',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching team leave requests:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch team leave requests',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (requestId) => {
    setActionDialog({ open: true, type: 'approve', requestId, reason: '' });
  };

  const handleReject = (requestId) => {
    setActionDialog({ open: true, type: 'reject', requestId, reason: '' });
  };

  const handleActionSubmit = async () => {
    const { type, requestId, reason } = actionDialog;
    
    try {
      let response;
      if (type === 'approve') {
        response = await approveLeaveRequest(requestId, reason);
      } else {
        if (!reason.trim()) {
          setSnackbar({
            open: true,
            message: 'Please provide a reason for rejection',
            severity: 'error'
          });
          return;
        }
        response = await rejectLeaveRequest(requestId, reason);
      }

      if (response.success) {
        setSnackbar({
          open: true,
          message: `Leave request ${type === 'approve' ? 'approved' : 'rejected'} successfully`,
          severity: 'success'
        });
        setActionDialog({ open: false, type: '', requestId: null, reason: '' });
        fetchTeamLeaveRequests(); // Refresh the list
      } else {
        setSnackbar({
          open: true,
          message: response.message || `Failed to ${type} leave request`,
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to ${type} leave request`,
        severity: 'error'
      });
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
      <EmpRMNav />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          mt: 8,
          ml: { sm: '260px' },
          backgroundColor: '#f8fafc',
          minHeight: '100vh'
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mb: 1, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
            Team Leave Requests
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontSize: '1.1rem' }}>
            Review and manage leave requests from your team members
          </Typography>
        </Box>

        <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment sx={{ color: '#2196f3' }} />
              Team Leave Request Management
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>Loading team leave requests...</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Cover Up</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Submitted</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#374151' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ color: '#64748b' }}>
                          No team leave requests found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaveRequests.map((request) => (
                      <TableRow key={request.LeaveRequestID} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ 
                              bgcolor: '#2196f3', 
                              width: 32, 
                              height: 32,
                              fontSize: '0.8rem'
                            }}>
                              {request.employee?.FirstName?.charAt(0) || 'E'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {request.employee?.FirstName} {request.employee?.LastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                {request.employee?.role?.RoleName}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {request.leaveType?.LeaveName}
                          </Typography>
                        </TableCell>
                        <TableCell>{new Date(request.StartDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(request.EndDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${calculateDays(request.StartDate, request.EndDate)} days`} 
                            size="small" 
                            sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }} 
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
                            {request.Reason}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {request.coverUpEmployee ? (
                            <Typography variant="body2" sx={{ color: '#374151' }}>
                              {request.coverUpEmployee.FirstName} {request.coverUpEmployee.LastName}
                            </Typography>
                          ) : (
                            <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                              None
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusText(request.LeaveStatus)} 
                            color={getStatusColor(request.LeaveStatus)} 
                            size="small" 
                            sx={{ fontWeight: 600 }} 
                          />
                        </TableCell>
                        <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                        <TableCell align="center">
                          {request.LeaveStatus === 'pending' ? (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="Approve Request">
                                <IconButton 
                                  size="small" 
                                  sx={{ 
                                    color: '#10b981',
                                    '&:hover': { bgcolor: '#d1fae5' }
                                  }}
                                  onClick={() => handleApprove(request.LeaveRequestID)}
                                >
                                  <ThumbUp />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject Request">
                                <IconButton 
                                  size="small" 
                                  sx={{ 
                                    color: '#ef4444',
                                    '&:hover': { bgcolor: '#fee2e2' }
                                  }}
                                  onClick={() => handleReject(request.LeaveRequestID)}
                                >
                                  <ThumbDown />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Tooltip title="View Details">
                              <IconButton size="small" sx={{ color: '#2196f3', '&:hover': { bgcolor: '#e3f2fd' } }}>
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Action Dialog */}
        <Dialog 
          open={actionDialog.open} 
          onClose={() => setActionDialog({ open: false, type: '', requestId: null, reason: '' })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {actionDialog.type === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={actionDialog.type === 'approve' ? 'Approval Note (Optional)' : 'Rejection Reason (Required)'}
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={actionDialog.reason}
              onChange={(e) => setActionDialog({ ...actionDialog, reason: e.target.value })}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setActionDialog({ open: false, type: '', requestId: null, reason: '' })}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleActionSubmit}
              variant="contained"
              color={actionDialog.type === 'approve' ? 'success' : 'error'}
            >
              {actionDialog.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default LeaveRequests;
