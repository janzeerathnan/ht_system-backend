import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { createLeaveType, getRoles } from '../api';

const AddLeaveModal = ({ isOpen, onClose, onAddLeaveType }) => {
  const [formData, setFormData] = useState({
    LeaveName: '',
    NumberOfLeaves: '',
    EmployeeType: '',
    RoleID: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const dialogRef = useRef(null);

  // Fetch roles when component mounts
  useEffect(() => {
    fetchRoles();
  }, []);

  // Focus management
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Focus the first input when modal opens
      const firstInput = dialogRef.current.querySelector('input, select');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const response = await getRoles();
      if (response.success) {
        setRoles(response.data);
      } else {
        console.error('Failed to fetch roles:', response.message);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setRolesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.LeaveName.trim()) {
      newErrors.LeaveName = 'Leave type name is required';
    }
    
    if (!formData.NumberOfLeaves) {
      newErrors.NumberOfLeaves = 'Number of leaves is required';
    } else if (formData.NumberOfLeaves < 1) {
      newErrors.NumberOfLeaves = 'Number of leaves must be at least 1';
    }
    
    if (!formData.EmployeeType) {
      newErrors.EmployeeType = 'Employee type is required';
    }
    
    if (!formData.RoleID) {
      newErrors.RoleID = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);
      
      try {
        const response = await createLeaveType({
          LeaveName: formData.LeaveName.trim(),
          NumberOfLeaves: parseInt(formData.NumberOfLeaves),
          EmployeeType: formData.EmployeeType,
          RoleID: parseInt(formData.RoleID)
        });

        if (response.success) {
          showSnackbar('Leave type created successfully!', 'success');
          
          // Reset form
          setFormData({
            LeaveName: '',
            NumberOfLeaves: '',
            EmployeeType: '',
            RoleID: ''
          });
          setErrors({});
          
          // Call parent callback to refresh data
          if (onAddLeaveType) {
            onAddLeaveType(response.data);
          }
          
          // Close modal after a short delay to show success message
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          showSnackbar(response.message || 'Failed to create leave type', 'error');
        }
      } catch (error) {
        console.error('Error creating leave type:', error);
        showSnackbar('Failed to create leave type. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      LeaveName: '',
      NumberOfLeaves: '',
      EmployeeType: '',
      RoleID: ''
    });
    setErrors({});
    onClose();
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog 
        open={isOpen} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
        ref={dialogRef}
      >
        <DialogTitle sx={{ 
          bgcolor: '#f8f9fa', 
          borderBottom: '1px solid #e0e0e0',
          fontWeight: 600,
          color: '#941936',
          fontFamily: 'var(--front-primary, sans-serif)'
        }}>
          Add New Leave Type
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Leave Type Name */}
              <TextField
                fullWidth
                label="Leave Type Name"
                name="LeaveName"
                value={formData.LeaveName}
              onChange={handleChange}
                error={!!errors.LeaveName}
                helperText={errors.LeaveName}
                placeholder="e.g., Annual Leave, Sick Leave"
              required
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#941936',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#941936',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#941936',
                  },
                }}
              />

              {/* Number of Leaves */}
              <TextField
                fullWidth
                label="Number of Leaves"
                name="NumberOfLeaves"
                type="number"
                value={formData.NumberOfLeaves}
              onChange={handleChange}
                error={!!errors.NumberOfLeaves}
                helperText={errors.NumberOfLeaves}
                inputProps={{ min: 1 }}
                placeholder="e.g., 14"
              required
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#941936',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#941936',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#941936',
                  },
                }}
              />

              {/* Employee Type */}
              <FormControl fullWidth error={!!errors.EmployeeType}>
                <InputLabel>Employee Type</InputLabel>
                <Select
                  name="EmployeeType"
                  value={formData.EmployeeType}
              onChange={handleChange}
                  label="Employee Type"
              required
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      '&:hover': {
                        borderColor: '#941936',
                      },
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#941936',
                    },
                  }}
                >
                  <MenuItem value="all">All Employees</MenuItem>
                  <MenuItem value="full-time">Full-time</MenuItem>
                  <MenuItem value="part-time">Part-time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="intern">Intern</MenuItem>
                  <MenuItem value="temporary">Temporary</MenuItem>
                </Select>
                {errors.EmployeeType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.EmployeeType}
                  </Typography>
                )}
              </FormControl>

              {/* Role ID */}
              <FormControl fullWidth error={!!errors.RoleID}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="RoleID"
                  value={formData.RoleID}
            onChange={handleChange}
                  label="Role"
            required
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      '&:hover': {
                        borderColor: '#941936',
                      },
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#941936',
                    },
                  }}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.RoleID} value={role.RoleID}>
                      {role.RoleName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.RoleID && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.RoleID}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1, bgcolor: '#f8f9fa' }}>
            <Button 
              onClick={handleClose}
              variant="outlined"
              disabled={loading}
              sx={{ 
                borderColor: '#666',
                color: '#666',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#333',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
            Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#941936',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: '#7a0f2b'
                },
                '&:disabled': {
                  bgcolor: '#ccc'
                }
              }}
            >
              {loading ? 'Creating...' : 'Add Leave Type'}
            </Button>
          </DialogActions>
      </form>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddLeaveModal;
