import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit } from 'lucide-react';
import AdminNav from "../../../navbars/AdminNav";
import AddLeaveModal from '../../../components/AddLeaveFom';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { 
  getLeaveTypes, 
  toggleLeaveTypeActive, 
  deleteLeaveType, 
  updateLeaveType,
  getRoles
} from '../../../api';
import { useToast } from '../../../components/ToastProvider';

const LeaveSettingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, leaveId: null, leaveName: '' });
  const [editDialog, setEditDialog] = useState({ open: false, leaveType: null });
  const deleteDialogRef = useRef(null);
  const { showToast } = useToast();

  // Fetch leave types from backend
  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const response = await getLeaveTypes();
      if (response.success) {
        setLeaveData(response.data);
      } else {
        showToast('Failed to load leave types', 'error');
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
      showToast('Failed to load leave types', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
    document.title = 'Leave Settings';
  }, []);

  // Focus management for delete dialog
  useEffect(() => {
    if (deleteDialog.open && deleteDialogRef.current) {
      // Focus the cancel button when delete dialog opens
      const cancelButton = deleteDialogRef.current.querySelector('button[onclick*="handleDeleteCancel"]');
      if (cancelButton) {
        setTimeout(() => cancelButton.focus(), 100);
      }
    }
  }, [deleteDialog.open]);

  const handleDelete = (id, name) => {
    setDeleteDialog({ open: true, leaveId: id, leaveName: name });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.leaveId) {
      try {
        const response = await deleteLeaveType(deleteDialog.leaveId);
        if (response.success) {
          showToast('Leave type deleted successfully', 'success');
          fetchLeaveTypes(); // Refresh the list
        } else {
          showToast('Failed to delete leave type', 'error');
        }
      } catch (error) {
        showToast('Failed to delete leave type', 'error');
      }
    }
    setDeleteDialog({ open: false, leaveId: null, leaveName: '' });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, leaveId: null, leaveName: '' });
  };

  const handleStatusToggle = async (id) => {
    try {
      const leaveType = leaveData.find(lt => lt.LeaveTypeID === id);
      const newStatus = !leaveType.IsActive;
      
      const response = await toggleLeaveTypeActive(id, newStatus);
      if (response.success) {
        const status = newStatus ? 'activated' : 'deactivated';
        showToast(`Leave type ${status} successfully`, 'success');
        fetchLeaveTypes(); // Refresh the list
      } else {
        showToast('Failed to update leave type status', 'error');
      }
    } catch (error) {
      showToast('Failed to update leave type status', 'error');
    }
  };

  const handleEdit = (leaveType) => {
    setEditDialog({ open: true, leaveType });
  };

  const handleEditSubmit = async (formData) => {
    try {
      const response = await updateLeaveType(editDialog.leaveType.LeaveTypeID, formData);
      if (response.success) {
        showToast('Leave type updated successfully', 'success');
        fetchLeaveTypes(); // Refresh the list
        setEditDialog({ open: false, leaveType: null });
      } else {
        showToast('Failed to update leave type', 'error');
      }
    } catch (error) {
      showToast('Failed to update leave type', 'error');
    }
  };

  const handleAddLeaveType = (newLeaveType) => {
    // Add the new leave type to the list
    setLeaveData(prev => [...prev, newLeaveType]);
    showToast('Leave type added successfully', 'success');
  };

  const filteredData = leaveData.filter(leave =>
    leave.LeaveName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.EmployeeType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmployeeTypeLabel = (type) => {
    const labels = {
      'all': 'All Employees',
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'intern': 'Intern',
      'temporary': 'Temporary'
    };
    return labels[type] || type;
  };

  return (
    <>
      <AdminNav />
      
      <div className="main-content">
        <Box sx={{ p: 3 }}>
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            backgroundColor: 'white',
            padding: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              color: '#941936',
              fontFamily: 'var(--front-primary, sans-serif)'
            }}>
              Leave Settings
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#941936',
                '&:hover': { backgroundColor: '#7a0f2b' },
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1.5
              }}
              startIcon={<Plus size={18} />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Leave Type
            </Button>
          </Box>

          {/* Search Section */}
          <Box sx={{ 
            mb: 4,
            backgroundColor: 'white',
            padding: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 500 }}>
              Search Leave Types
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by Leave Name or Employee Type"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#941936',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#941936',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} style={{ color: '#941936' }} />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Table Section */}
          <Box sx={{ 
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              p: 3, 
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#f8f9fa'
            }}>
              <Typography variant="h6" sx={{ color: '#333', fontWeight: 500 }}>
                Leave Types ({filteredData.length})
              </Typography>
            </Box>
            
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>Loading leave types...</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#941936' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#941936' }}>Leave ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#941936' }}>Leave Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#941936' }}>Number of Leaves</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#941936' }}>Employee Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#941936' }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#941936' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#941936' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((leave) => (
                        <TableRow key={leave.LeaveTypeID} hover sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell align="center" sx={{ fontWeight: 500, color: '#941936' }}>
                            {leave.LeaveTypeID}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 500, color: '#1976d2' }}>
                            {leave.LeaveID}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 500 }}>
                            {leave.LeaveName}
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={leave.NumberOfLeaves} 
                              size="small" 
                              sx={{ 
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                fontWeight: 500
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              {getEmployeeTypeLabel(leave.EmployeeType)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              {leave.role ? leave.role.RoleName : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={leave.IsActive ? 'Active' : 'Inactive'}
                              color={leave.IsActive ? 'success' : 'default'}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                fontWeight: 500,
                                borderWidth: 2
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={() => handleEdit(leave)}
                                startIcon={<Edit size={16} />}
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 500,
                                  borderWidth: 2,
                                  '&:hover': {
                                    borderWidth: 2
                                  }
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color={leave.IsActive ? 'warning' : 'success'}
                                onClick={() => handleStatusToggle(leave.LeaveTypeID)}
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 500,
                                  borderWidth: 2,
                                  '&:hover': {
                                    borderWidth: 2
                                  }
                                }}
                              >
                                {leave.IsActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleDelete(leave.LeaveTypeID, leave.LeaveName)}
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 500,
                                  borderWidth: 2,
                                  '&:hover': {
                                    borderWidth: 2
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            {searchTerm ? 'No leave types match your search.' : 'No leave types found.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Add Leave Modal */}
          <AddLeaveModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddLeaveType={handleAddLeaveType}
          />

          {/* Edit Leave Modal */}
          <EditLeaveModal
            isOpen={editDialog.open}
            onClose={() => setEditDialog({ open: false, leaveType: null })}
            leaveType={editDialog.leaveType}
            onSubmit={handleEditSubmit}
          />

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialog.open}
            onClose={handleDeleteCancel}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            disableAutoFocus
            disableEnforceFocus
            disableRestoreFocus
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }
            }}
            ref={deleteDialogRef}
          >
            <DialogTitle id="delete-dialog-title" sx={{ 
              color: '#941936',
              fontWeight: 600,
              borderBottom: '1px solid #e0e0e0'
            }}>
              Confirm Delete Leave Type
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <DialogContentText id="delete-dialog-description" sx={{ color: '#666' }}>
                Are you sure you want to delete the leave type{' '}
                <strong style={{ color: '#941936' }}>"{deleteDialog.leaveName}"</strong>?
                <br />
                <br />
                This action cannot be undone. All associated leave requests and settings will be permanently removed.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button 
                onClick={handleDeleteCancel} 
                variant="outlined"
                sx={{ 
                  borderColor: '#666',
                  color: '#666',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#333',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm} 
                variant="contained"
                sx={{
                  bgcolor: '#d32f2f',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#c62828'
                  }
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </div>
    </>
  );
};

// Edit Leave Modal Component
const EditLeaveModal = ({ isOpen, onClose, leaveType, onSubmit }) => {
  const [formData, setFormData] = useState({
    LeaveName: '',
    NumberOfLeaves: '',
    EmployeeType: '',
    RoleID: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (leaveType) {
      setFormData({
        LeaveName: leaveType.LeaveName,
        NumberOfLeaves: leaveType.NumberOfLeaves.toString(),
        EmployeeType: leaveType.EmployeeType,
        RoleID: leaveType.RoleID
      });
    }
  }, [leaveType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
        await onSubmit({
          LeaveName: formData.LeaveName.trim(),
          NumberOfLeaves: parseInt(formData.NumberOfLeaves),
          EmployeeType: formData.EmployeeType,
          RoleID: formData.RoleID
        });
      } catch (error) {
        console.error('Error updating leave type:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      LeaveName: '',
      NumberOfLeaves: '',
      EmployeeType: '',
      RoleID: ''
    });
    setErrors({});
    onClose();
  };

  return (
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
        Edit Leave Type
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Leave Type Name"
              name="LeaveName"
              value={formData.LeaveName}
              onChange={handleChange}
              error={!!errors.LeaveName}
              helperText={errors.LeaveName}
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
            {loading ? 'Updating...' : 'Update Leave Type'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LeaveSettingsPage;
