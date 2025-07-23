import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,

  CircularProgress,
  Switch
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
  ThumbDown,
  Search,
  FilterList,
  Edit,
  Delete,
  Pending
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import EmpRMNav from '../../navbars/EmpRMNav';
import { getTeamLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from '../../api';
import { useToast } from '../../components/ToastProvider';

const LeaveRequests = () => {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [actionDialog, setActionDialog] = useState({ open: false, type: '', requestId: null, reason: '' });
  const [viewDialog, setViewDialog] = useState({ open: false, request: null });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const editDialogRef = useRef(null);
  const approvalDialogRef = useRef(null);
  const { showToast } = useToast();

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
    const role = employeeData?.role?.RoleName?.toLowerCase();

    if (!token) {
      navigate('/');
      return;
    }

    // Ensure this is for Reporting Managers only
    if (role !== 'rm') {
      navigate('/employee');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
    fetchTeamLeaveRequests();
    document.title = 'ICST | Leave Requests';
  }, [checkAuth]);

  const fetchTeamLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await getTeamLeaveRequests();
      
      if (response.success) {
        setLeaveRequests(response.data);
      } else {
        showToast(response.message || 'Failed to fetch team leave requests', 'error');
      }
    } catch (error) {
      showToast('Failed to fetch team leave requests', 'error');
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

  const handleViewDetails = (request) => {
    setViewDialog({ open: true, request });
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

  // Focus management for dialogs
  useEffect(() => {
    if (viewDialog.open && editDialogRef.current) {
      const textarea = editDialogRef.current.querySelector('textarea');
      if (textarea) {
        setTimeout(() => textarea.focus(), 100);
      }
    }
  }, [viewDialog.open]);

  useEffect(() => {
    if (actionDialog.open && approvalDialogRef.current) {
      const reasonInput = approvalDialogRef.current.querySelector('input[type="text"]');
      if (reasonInput) {
        setTimeout(() => reasonInput.focus(), 100);
      }
    }
  }, [actionDialog.open]);

  const handleApprovalSubmit = async () => {
    const { type, requestId, reason } = actionDialog;
    try {
      let response;
      if (type === 'approve') {
        response = await approveLeaveRequest(requestId, reason);
      } else {
        if (!reason.trim()) {
          showToast('Please provide a reason for rejection', 'error');
          return;
        }
        response = await rejectLeaveRequest(requestId, reason);
      }
      
      if (response.success) {
        setLeaveRequests(prev => prev.map(req => 
          req.LeaveRequestID === requestId 
            ? { 
                ...req, 
                LeaveStatus: type === 'approve' ? 'approved' : 'rejected',
                ApprovalDate: new Date().toISOString(),
                RejectionReason: type === 'reject' ? reason : req.RejectionReason
              }
            : req
        ));
        
        showToast(`Leave request ${type === 'approve' ? 'approved' : 'rejected'} successfully`, 'success');
        setActionDialog({ open: false, type: '', requestId: null, reason: '' });
      } else {
        showToast(response.message || `Failed to ${type} leave request`, 'error');
      }
    } catch (error) {
      console.error('Error approving/rejecting leave request:', error);
      showToast(`Failed to ${type} leave request`, 'error');
    }
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
          ml: { sm: '10px' },
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

        {loading ? (
          <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#64748b', mb: 2 }}>
                Loading team leave requests...
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Please wait while we fetch the latest data.
              </Typography>
            </Box>
          </Card>
        ) : (
          <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 3px rgba(155,28,60,0.15)', border: '2px solid #9b1c3c' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assignment sx={{ color: '#2196f3' }} />
                Team Leave Request Management
              </Typography>
            </Box>
            
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
                              bgcolor: '#9b1c3c', 
                              width: 32, 
                              height: 32,
                              fontSize: '0.8rem'
                            }}>
                              {request.employee?.FirstName?.charAt(0) || 'E'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }} component="span">
                                {request.employee?.FirstName} {request.employee?.LastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }} component="span">
                                {request.employee?.role?.RoleName}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }} component="span">
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
                          }} component="span">
                            {request.Reason}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {request.coverUpEmployee ? (
                            <Typography variant="body2" sx={{ color: '#374151' }} component="span">
                              {request.coverUpEmployee.FirstName} {request.coverUpEmployee.LastName}
                            </Typography>
                          ) : (
                            <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }} component="span">
                              None
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusText(request.LeaveStatus)} 
                            color={getStatusColor(request.LeaveStatus)} 
                            size="small" 
                            sx={{ fontWeight: 600, bgcolor: request.LeaveStatus === 'approved' ? '#102752' : request.LeaveStatus === 'rejected' ? '#9b1c3c' : '#e0e0e0', color: 'white' }} 
                          />
                        </TableCell>
                        <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            {request.LeaveStatus === 'pending' ? (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleApprove(request.LeaveRequestID)}
                                  sx={{ 
                                    minWidth: 'auto',
                                    px: 2,
                                    py: 0.5,
                                    fontSize: '0.75rem',
                                    textTransform: 'none',
                                    bgcolor: '#9b1c3c',
                                    color: 'white',
                                    fontWeight: 600,
                                    '&:hover': { bgcolor: '#102752' }
                                  }}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleReject(request.LeaveRequestID)}
                                  sx={{ 
                                    minWidth: 'auto',
                                    px: 2,
                                    py: 0.5,
                                    fontSize: '0.75rem',
                                    textTransform: 'none',
                                    bgcolor: '#102752',
                                    color: 'white',
                                    fontWeight: 600,
                                    '&:hover': { bgcolor: '#9b1c3c' }
                                  }}
                                >
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <>
                                <Tooltip title="View Details">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleViewDetails(request)}
                                    sx={{ color: '#2196f3', '&:hover': { bgcolor: '#e3f2fd' } }}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                                {request.LeaveStatus === 'approved' && (
                                  <Tooltip title="Approved">
                                    <IconButton size="small" sx={{ color: '#10b981', '&:hover': { bgcolor: '#d1fae5' } }}>
                                      <CheckCircle />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {request.LeaveStatus === 'rejected' && (
                                  <Tooltip title="Rejected">
                                    <IconButton size="small" sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}>
                                      <Cancel />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Action Dialog */}
        <Dialog 
          open={actionDialog.open} 
          onClose={() => setActionDialog({ open: false, type: '', requestId: null, reason: '' })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#102752', color: 'white' }}>
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
              onClick={handleApprovalSubmit}
              variant="contained"
              sx={{
                bgcolor: actionDialog.type === 'approve' ? '#9b1c3c' : '#102752',
                color: 'white',
                fontWeight: 600,
                '&:hover': { bgcolor: actionDialog.type === 'approve' ? '#102752' : '#9b1c3c' }
              }}
            >
              {actionDialog.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog 
          open={viewDialog.open} 
          onClose={() => setViewDialog({ open: false, request: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Leave Request Details
          </DialogTitle>
          <DialogContent>
            {viewDialog.request && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                      Employee
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {viewDialog.request.employee?.FirstName} {viewDialog.request.employee?.LastName}
                    </Typography>
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                      Leave Type
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {viewDialog.request.leaveType?.LeaveName}
                    </Typography>
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                      Start Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {new Date(viewDialog.request.StartDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                      End Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {new Date(viewDialog.request.EndDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                      Duration
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {calculateDays(viewDialog.request.StartDate, viewDialog.request.EndDate)} days
                    </Typography>
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                      Status
                    </Typography>
                    <Chip 
                      label={getStatusText(viewDialog.request.LeaveStatus)} 
                      color={getStatusColor(viewDialog.request.LeaveStatus)} 
                      size="small" 
                      sx={{ fontWeight: 600 }} 
                    />
                  </Grid>
                  <Grid sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                      Reason
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }} component="span">
                      {viewDialog.request.Reason}
                    </Typography>
                  </Grid>
                  <Grid sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }} component="span">
                      {viewDialog.request.Description || 'No additional description provided'}
                    </Typography>
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                      Cover Up Employee
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }} component="span">
                      {viewDialog.request.coverUpEmployee ? 
                        `${viewDialog.request.coverUpEmployee.FirstName} ${viewDialog.request.coverUpEmployee.LastName}` : 
                        'None assigned'
                      }
                    </Typography>
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                      Submitted Date
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }} component="span">
                      {new Date(viewDialog.request.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setViewDialog({ open: false, request: null })}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
};

export default LeaveRequests;
