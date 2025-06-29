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
import { createHoliday } from '../api';

const AddHolidayForm = ({ isOpen, onClose, onAddHoliday }) => {
  const [formData, setFormData] = useState({
    HolidayName: '',
    StartDate: '',
    EndDate: '',
    Description: '',
    Type: 'company'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const dialogRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const firstInput = dialogRef.current.querySelector('input, select');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }, [isOpen]);

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
    
    if (!formData.HolidayName.trim()) {
      newErrors.HolidayName = 'Holiday name is required';
    }
    
    if (!formData.StartDate) {
      newErrors.StartDate = 'Start date is required';
    }
    
    if (!formData.EndDate) {
      newErrors.EndDate = 'End date is required';
    } else if (formData.StartDate && new Date(formData.EndDate) < new Date(formData.StartDate)) {
      newErrors.EndDate = 'End date must be after start date';
    }
    
    if (!formData.Type) {
      newErrors.Type = 'Holiday type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        const response = await createHoliday({
          HolidayName: formData.HolidayName.trim(),
          StartDate: formData.StartDate,
          EndDate: formData.EndDate,
          Description: formData.Description.trim(),
          Type: formData.Type
        });

        if (response.success) {
          showSnackbar('Holiday created successfully!', 'success');
          
          // Reset form
          setFormData({
            HolidayName: '',
            StartDate: '',
            EndDate: '',
            Description: '',
            Type: 'company'
          });
          setErrors({});
          
          // Call parent callback to refresh data
          if (onAddHoliday) {
            onAddHoliday(response.data);
          }
          
          // Close modal after a short delay to show success message
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          showSnackbar(response.message || 'Failed to create holiday', 'error');
        }
      } catch (error) {
        console.error('Error creating holiday:', error);
        showSnackbar('Failed to create holiday. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      HolidayName: '',
      StartDate: '',
      EndDate: '',
      Description: '',
      Type: 'company'
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
          Add New Holiday
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Holiday Name */}
              <TextField
                fullWidth
                label="Holiday Name"
                name="HolidayName"
                value={formData.HolidayName}
                onChange={handleChange}
                error={!!errors.HolidayName}
                helperText={errors.HolidayName}
                placeholder="e.g., Company Annual Dinner"
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

              {/* Start Date */}
              <TextField
                fullWidth
                label="Start Date"
                name="StartDate"
                type="date"
                value={formData.StartDate}
                onChange={handleChange}
                error={!!errors.StartDate}
                helperText={errors.StartDate}
                required
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
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

              {/* End Date */}
              <TextField
                fullWidth
                label="End Date"
                name="EndDate"
                type="date"
                value={formData.EndDate}
                onChange={handleChange}
                error={!!errors.EndDate}
                helperText={errors.EndDate}
                required
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
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

              {/* Description */}
              <TextField
                fullWidth
                label="Description"
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Optional description of the holiday"
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

              {/* Holiday Type */}
              <FormControl fullWidth error={!!errors.Type}>
                <InputLabel>Holiday Type</InputLabel>
                <Select
                  name="Type"
                  value={formData.Type}
                  onChange={handleChange}
                  label="Holiday Type"
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
                  <MenuItem value="company">Company Holiday</MenuItem>
                  <MenuItem value="public">Public Holiday</MenuItem>
                </Select>
                {errors.Type && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.Type}
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
              {loading ? 'Creating...' : 'Add Holiday'}
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

export default AddHolidayForm; 