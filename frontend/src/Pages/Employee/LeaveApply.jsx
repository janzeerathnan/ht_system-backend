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
  Card,
  CardContent,
  Chip,
  Input,
  FormHelperText
} from '@mui/material';
import EmpNav from '../../navbars/EmpNav';
import { 
  getEmployeesForLeave, 
  getLeaveTypesForRequest, 
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
  const [document, setDocument] = useState(null);
  const [errors, setErrors] = useState({});
  const [employee, setEmployee] = useState({});

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');

      if (!token) {
        window.location.href = '/';
        return;
      }

      setEmployee(employeeData);
    };

    checkAuth();
    fetchData();
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
        setLeaveTypes(leaveTypesRes.data);
      }

      if (employeesRes.success) {
        setEmployees(employeesRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
    } else if (new Date(leaveForm.StartDate) < new Date()) {
      newErrors.StartDate = 'Start date cannot be in the past';
    }

    if (!leaveForm.EndDate) {
      newErrors.EndDate = 'End date is required';
    } else if (new Date(leaveForm.EndDate) < new Date(leaveForm.StartDate)) {
      newErrors.EndDate = 'End date must be after start date';
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
      formData.append('CoverUpEMPID', leaveForm.CoverUpEMPID || '');
      formData.append('StartDate', leaveForm.StartDate);
      formData.append('EndDate', leaveForm.EndDate);
      formData.append('Reason', leaveForm.Reason);
      formData.append('Description', leaveForm.Description || '');
      
      if (document) {
        formData.append('document', document);
      }

      const response = await submitLeaveRequest(formData);
      
      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Leave application submitted successfully! Your request has been sent to your reporting manager for approval.'
        });
        
        // Reset form
        setLeaveForm({
          LeaveTypeID: '',
          CoverUpEMPID: '',
          StartDate: '',
          EndDate: '',
          Reason: '',
          Description: ''
        });
        setDocument(null);
        setErrors({});
        
        // Redirect to employee dashboard after 3 seconds
        setTimeout(() => {
          window.location.href = '/employee';
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Failed to submit leave application. Please try again.'
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
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
    
    // Clear error when user starts typing
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
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'File size must be less than 2MB'
        });
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({
          type: 'error',
          text: 'Please upload a valid file (PDF, DOC, DOCX, JPG, PNG)'
        });
        return;
      }
      
      setDocument(file);
      setMessage({ type: '', text: '' });
    }
  };

  const calculateDays = () => {
    if (leaveForm.StartDate && leaveForm.EndDate) {
      const start = new Date(leaveForm.StartDate);
      const end = new Date(leaveForm.EndDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

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
          Leave Application
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#941936', mb: 3 }}>
                Apply for Leave
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth error={!!errors.LeaveTypeID}>
                      <InputLabel>Leave Type</InputLabel>
                      <Select
                        value={leaveForm.LeaveTypeID}
                        label="Leave Type"
                        onChange={(e) => handleInputChange('LeaveTypeID', e.target.value)}
                        required
                      >
                        {leaveTypes.map((type) => (
                          <MenuItem key={type.LeaveTypeID} value={type.LeaveTypeID}>
                            {type.LeaveName} ({type.NumberOfLeaves} days)
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.LeaveTypeID && (
                        <FormHelperText>{errors.LeaveTypeID}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Cover Up Employee (Optional)</InputLabel>
                      <Select
                        value={leaveForm.CoverUpEMPID}
                        label="Cover Up Employee (Optional)"
                        onChange={(e) => handleInputChange('CoverUpEMPID', e.target.value)}
                      >
                        <MenuItem value="">None</MenuItem>
                        {employees.map((emp) => (
                          <MenuItem key={emp.EMPID} value={emp.EMPID}>
                            {emp.FirstName} {emp.LastName} ({emp.role?.RoleName})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
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

                  <Grid size={{ xs: 12, md: 6 }}>
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

                  <Grid size={{ xs: 12 }}>
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

                  <Grid size={{ xs: 12 }}>
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

                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth>
                      <InputLabel>Document (Optional)</InputLabel>
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        inputProps={{
                          accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
                        }}
                      />
                      <FormHelperText>
                        Upload supporting document (PDF, DOC, DOCX, JPG, PNG) - Max 2MB
                      </FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
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

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#941936', mb: 3 }}>
                Leave Summary
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                  Selected Leave Type
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {leaveTypes.find(type => type.LeaveTypeID === leaveForm.LeaveTypeID)?.LeaveName || 'Not selected'}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                  Leave Duration
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {calculateDays()} days
                </Typography>
                {leaveForm.StartDate && leaveForm.EndDate && (
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {new Date(leaveForm.StartDate).toLocaleDateString()} - {new Date(leaveForm.EndDate).toLocaleDateString()}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                  Cover Up Employee
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {employees.find(emp => emp.EMPID === leaveForm.CoverUpEMPID) 
                    ? `${employees.find(emp => emp.EMPID === leaveForm.CoverUpEMPID).FirstName} ${employees.find(emp => emp.EMPID === leaveForm.CoverUpEMPID).LastName}`
                    : 'None selected'
                  }
                </Typography>
              </Box>

              {document && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1 }}>
                    Attached Document
                  </Typography>
                  <Chip 
                    label={document.name} 
                    size="small" 
                    sx={{ bgcolor: '#e0f2fe', color: '#0369a1' }}
                  />
                </Box>
              )}

              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8fafc', 
                borderRadius: 1, 
                border: '1px solid #e2e8f0' 
              }}>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  <strong>Note:</strong> Your leave request will be reviewed by your reporting manager. 
                  You will receive a notification once the request is approved or rejected.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LeaveApply; 