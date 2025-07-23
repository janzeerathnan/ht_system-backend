import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';
import EmpRMNav from '../../navbars/EmpRMNav';
import { useToast } from '../../components/ToastProvider';

const SettingsRM = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    employeeId: '',
    username: '',
    role: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfile, setOriginalProfile] = useState({});
  const { showToast } = useToast();
  const dashboardName = 'Settings RM';

  useEffect(() => {
    // Get employee data from localStorage
    const employee = JSON.parse(localStorage.getItem('employee') || '{}');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const profileData = {
      firstName: employee.FirstName || '',
      lastName: employee.LastName || '',
      email: user.email || 'Not Provided',
      phone: (employee.contactInformation?.PhoneNumber || 'Not Provided'),
      address: (employee.contactInformation?.Address || 'Not Provided'),
      employeeId: employee.EmployeeID || '',
      username: user.username || 'Not Provided',
      role: employee.role?.RoleName || ''
    };
    setProfile(profileData);
    setOriginalProfile(profileData);
    document.title = 'ICST | Settings RM';
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    showToast('Profile updated successfully!', 'success');
    setOriginalProfile(profile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <EmpRMNav />
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#941936', mb: 4, textAlign: 'center' }}>
            Settings RM
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Manage your personal and contact information below.
          </Typography>
        </Box>
        <Grid container spacing={4} sx={{ maxWidth: 900, mx: 'auto' }}>
          {/* Profile Card - Left Side */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center', borderRadius: 3, boxShadow: '0 1px 6px rgba(166,5,21,0.15)', border: '2px solid #a60515' }}>
              <CardContent>
                <Avatar
                  sx={{
                    width: 110,
                    height: 110,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'linear-gradient(135deg, #a60515 0%, #941936 100%)',
                    fontSize: '3rem'
                  }}
                >
                  {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Chip label={profile.role || 'Reporting Manager'} sx={{ mb: 2, bgcolor: '#a60515', color: 'white', fontWeight: 600 }} />
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Employee ID
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>{profile.employeeId}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Username
                </Typography>
                <Typography variant="h6">{profile.username}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Editable Info - Right Side */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ color: '#941936', fontWeight: 700 }}>Personal & Contact Information</Typography>
                {!isEditing ? (
                  <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit} sx={{ borderColor: '#a60515', color: '#a60515', fontWeight: 600, '&:hover': { borderColor: '#941936', color: '#941936' } }}>Edit</Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} sx={{ bgcolor: '#a60515', fontWeight: 600, '&:hover': { bgcolor: '#941936' } }}>Save</Button>
                    <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel} sx={{ borderColor: '#a60515', color: '#a60515', fontWeight: 600, '&:hover': { borderColor: '#941936', color: '#941936' } }}>Cancel</Button>
                  </Box>
                )}
              </Box>
              <Grid container spacing={3}>
                {/* Basic Info */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profile.firstName}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{ startAdornment: <Person sx={{ mr: 1, color: '#666' }} /> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profile.lastName}
                    onChange={e => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{ startAdornment: <Person sx={{ mr: 1, color: '#666' }} /> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{ startAdornment: <Email sx={{ mr: 1, color: '#666' }} /> }}
                    placeholder="Not Provided"
                  />
                </Grid>
                {/* Read-only fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={profile.employeeId}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={profile.username}
                    disabled
                  />
                </Grid>
                {/* Contact Info */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profile.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: '#666' }} /> }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={profile.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={2}
                    InputProps={{ startAdornment: <LocationOn sx={{ mr: 1, color: '#666', mt: 1 }} /> }}
                    placeholder="Not Provided"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SettingsRM; 