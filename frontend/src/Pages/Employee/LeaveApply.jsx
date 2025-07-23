import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormHelperText
} from '@mui/material';
import EmpNav from '../../navbars/EmpNav';
import { 
  getLeaveTypesForRequest,
  getEmployeesForLeave,
  submitLeaveRequest 
} from '../../api';

const LeaveApply = () => {
  const [leaveForm, setLeaveForm] = useState({
    LeaveTypeID: '',
    CoverUpEMPID: '',
    StartDate: '',
    EndDate: '',
    Reason: '',
    Description: ''
  });
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [leaveDocument, setLeaveDocument] = useState(null);
  const [errors, setErrors] = useState({});
  const [employee, setEmployee] = useState({});
  const [leaveDayType, setLeaveDayType] = useState('full');
  const dashboardName = 'Leave Application';

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');

      if (!token) {
        window.location.href = '/';
        return;
      }

      // Check if user is an employee
      if (employeeData?.role?.RoleName?.toLowerCase() !== 'employee') {
        window.location.href = '/';
        return;
      }

      setEmployee(employeeData);
    };

    checkAuth();
    fetchData();
    if (typeof window !== 'undefined' && window.document) {
      window.document.title = 'ICST | Leave Application';
    }
  }, []);

  const fetchData = async () => {
    try {
      const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
      const currentEmpId = employeeData?.EMPID;

      const [leaveTypesRes, employeesRes] = await Promise.all([
        getLeaveTypesForRequest(),
        getEmployeesForLeave(currentEmpId)
      ]);

      if (leaveTypesRes.success) {
        const employeeLeaveTypes = leaveTypesRes.data.filter(type => 
          type.RoleID === employeeData?.role?.RoleID || type.RoleID === null
        );
        setLeaveTypes(employeeLeaveTypes);
      }

      if (employeesRes.success) {
        setEmployees(employeesRes.data);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to load form data. Please refresh the page.'
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!leaveForm.LeaveTypeID) {
      newErrors.LeaveTypeID = 'Leave type is required';
    }

    if (!leaveForm.StartDate) {
      newErrors.StartDate = 'Start date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(leaveForm.StartDate);
      startDate.setHours(0, 0, 0, 0);
      if (startDate < today) {
        newErrors.StartDate = 'Start date cannot be in the past';
      }
    }

    if (!leaveForm.EndDate) {
      newErrors.EndDate = 'End date is required';
    } else {
      const startDate = new Date(leaveForm.StartDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(leaveForm.EndDate);
      endDate.setHours(0, 0, 0, 0);
      if (endDate < startDate) {
        newErrors.EndDate = 'End date must be after start date';
      }
    }

    if (!leaveForm.Reason.trim()) {
      newErrors.Reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const formData = new FormData();
      formData.append('LeaveTypeID', leaveForm.LeaveTypeID);
      if (leaveForm.CoverUpEMPID) {
        formData.append('cover_up_employee_id', leaveForm.CoverUpEMPID);
      }
      formData.append('StartDate', leaveForm.StartDate);
      formData.append('EndDate', leaveForm.EndDate);
      formData.append('Reason', leaveForm.Reason);
      formData.append('Description', leaveForm.Description || '');
      formData.append('leave_day_type', leaveDayType);
      
      if (leaveDocument) {
        formData.append('document', leaveDocument);
      }

      const response = await submitLeaveRequest(formData);
      
      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Leave application submitted successfully! Your request has been sent to your reporting manager for approval.'
        });
        
        setLeaveForm({
          LeaveTypeID: '',
          CoverUpEMPID: '',
          StartDate: '',
          EndDate: '',
          Reason: '',
          Description: ''
        });
        setLeaveDocument(null);
        setErrors({});
        
        setTimeout(() => {
          window.location.href = '/employee';
        }, 3000);
      } else {
        let errorText = response.message || 'Failed to submit leave application. Please try again.';
        if (response.errors) {
          errorText += '\n' + Object.values(response.errors).join(' ');
        }
        setMessage({
          type: 'error',
          text: errorText
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to submit leave application. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setLeaveForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'File size must be less than 2MB'
        });
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({
          type: 'error',
          text: 'Please upload a valid file (PDF, DOC, DOCX, JPG, PNG)'
        });
        return;
      }
      
      setLeaveDocument(file);
      setMessage({ type: '', text: '' });
    }
  };

  // Clear message after 4 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

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
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#941936', mb: 4, textAlign: 'center' }}>
          Leave Application
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3} columns={12}>
          <Grid sx={{ width: '100%' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#941936', mb: 3 }}>
                Apply for Leave
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3} columns={12}>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <FormControl fullWidth error={!!errors.LeaveTypeID}>
                      <InputLabel>Leave Type</InputLabel>
                      <Select
                        value={leaveForm.LeaveTypeID}
                        label="Leave Type"
                        onChange={(e) => handleInputChange('LeaveTypeID', e.target.value)}
                        required
                      >
                        {leaveTypes.map((type) => (
                          <MenuItem 
                            key={type.LeaveTypeID} 
                            value={type.LeaveTypeID}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start'
                            }}
                          >
                            <Typography variant="subtitle1">
                              {type.LeaveName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Available: {type.NumberOfLeaves} days
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.LeaveTypeID && (
                        <FormHelperText>{errors.LeaveTypeID}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Cover Up Employee (Optional)</InputLabel>
                      <Select
                        value={leaveForm.CoverUpEMPID}
                        label="Cover Up Employee (Optional)"
                        onChange={(e) => handleInputChange('CoverUpEMPID', e.target.value)}
                      >
                        <MenuItem value="">None</MenuItem>
                        {employees
                          .filter(emp => emp.EMPID !== employee?.EMPID)
                          .map((emp) => (
                          <MenuItem key={emp.EMPID} value={emp.EMPID}>
                            {emp.FirstName} {emp.LastName} ({emp.role?.RoleName})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={leaveForm.StartDate}
                      onChange={(e) => handleInputChange('StartDate', e.target.value)}
                      required
                      error={!!errors.StartDate}
                      helperText={errors.StartDate}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={leaveForm.EndDate}
                      onChange={(e) => handleInputChange('EndDate', e.target.value)}
                      required
                      error={!!errors.EndDate}
                      helperText={errors.EndDate}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: leaveForm.StartDate
                      }}
                    />
                  </Grid>

                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Leave Day Type</InputLabel>
                      <Select
                        value={leaveDayType}
                        label="Leave Day Type"
                        onChange={(e) => setLeaveDayType(e.target.value)}
                      >
                        <MenuItem value="full">Full Day</MenuItem>
                        <MenuItem value="half">Half Day</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      {leaveDocument ? leaveDocument.name : 'Upload Document (PDF, DOC, JPG, PNG, max 2MB)'}
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </Button>
                  </Grid>

                  <Grid sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Reason"
                      value={leaveForm.Reason}
                      onChange={(e) => handleInputChange('Reason', e.target.value)}
                      required
                      error={!!errors.Reason}
                      helperText={errors.Reason}
                    />
                  </Grid>

                  <Grid sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={4}
                      value={leaveForm.Description}
                      onChange={(e) => handleInputChange('Description', e.target.value)}
                      placeholder="Please provide additional details about your leave request..."
                    />
                  </Grid>

                  <Grid sx={{ width: '100%' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        bgcolor: '#941936',
                        '&:hover': { bgcolor: '#7a0f2b' }
                      }}
                    >
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LeaveApply; 