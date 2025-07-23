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
import EmpRMNav from '../../navbars/EmpRMNav';
import { 
  getEmployeesForLeave, 
  getLeaveTypesForRequest, 
  submitLeaveRequest 
} from '../../api';
import { useToast } from '../../components/ToastProvider';

const LeaveApplyRM = () => {
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
  const [document, setDocument] = useState(null);
  const [errors, setErrors] = useState({});
  const [employee, setEmployee] = useState({});
  const { showToast } = useToast();
  const [leaveDayType, setLeaveDayType] = useState('full');
  const dashboardName = 'Leave Application RM';

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

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.document !== 'undefined' &&
      window.document &&
      typeof window.document.title !== 'undefined'
    ) {
      window.document.title = 'ICST | Leave Application RM';
    }
  }, []);

  const fetchData = async () => {
    try {
      const [leaveTypesRes, employeesRes] = await Promise.all([
        getLeaveTypesForRequest(),
        getEmployeesForLeave()
      ]);

      if (leaveTypesRes.success) {
        setLeaveTypes(leaveTypesRes.data);
      }

      if (employeesRes.success) {
        setEmployees(employeesRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load form data. Please refresh the page.', 'error');
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
    
    try {
      const formData = new FormData();
      formData.append('LeaveTypeID', leaveForm.LeaveTypeID);
      formData.append('CoverUpEMPID', leaveForm.CoverUpEMPID || '');
      formData.append('StartDate', leaveForm.StartDate);
      formData.append('EndDate', leaveForm.EndDate);
      formData.append('Reason', leaveForm.Reason);
      formData.append('Description', leaveForm.Description || '');
      formData.append('leave_day_type', leaveDayType);
      
      if (document) {
        formData.append('document', document);
      }

      const response = await submitLeaveRequest(formData);
      
      if (response.success) {
        showToast('Leave application submitted successfully!', 'success');
        
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
      } else {
        showToast(response.message || 'Failed to submit leave application.', 'error');
      }
    } catch (error) {
      showToast('Failed to submit leave application. Please try again.', 'error');
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
        showToast('File size must be less than 2MB', 'error');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Please upload a valid file (PDF, DOC, DOCX, JPG, PNG)', 'error');
        return;
      }
      
      setDocument(file);
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
          Leave Application RM
        </Typography>

        <Grid container spacing={3}>
          <Grid sx={{ width: { xs: '100%', md: '66.66%' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#941936', mb: 3 }}>
                Apply for Leave
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
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
                    <FormControl fullWidth>
                      <InputLabel >Document (Optional)</InputLabel>
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

                  <Grid sx={{ width: '100%' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(90deg, #a60515 0%, #941936 100%)',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { background: 'linear-gradient(90deg, #941936 0%, #a60515 100%)' }
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

export default LeaveApplyRM; 