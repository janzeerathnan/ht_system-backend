import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import { Edit, Save, Cancel, Person, Email, Phone, LocationOn, Cake, Badge } from '@mui/icons-material';
import { getContactInformation, updateContactInformation, updateEmployee } from '../../../api';
import { useToast } from '../../../components/ToastProvider';
import AdminNav from '../../../navbars/AdminNav';

const Profile = () => {
  const [employee, setEmployee] = useState(null);
  const [contact, setContact] = useState(null);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    birthday: '',
    nic: '',
    role: '',
    employeeId: '',
    username: ''
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    document.title = 'Profile';
    const emp = JSON.parse(localStorage.getItem('employee'));
    setEmployee(emp);
    if (emp?.EMPID) {
      fetchContact(emp.EMPID, emp);
    }
  }, []);

  const fetchContact = async (empId, emp) => {
    setLoading(true);
    const res = await getContactInformation(empId);
    if (res.success) {
      setContact(res.data);
      setProfile({
        fullName: (emp?.FirstName || '') + ' ' + (emp?.LastName || ''),
        email: res.data.email || emp?.Email || '',
        phone: res.data.phone || '',
        address: [res.data.streetNo, res.data.streetLine, res.data.city, res.data.district, res.data.province, res.data.postalCode].filter(Boolean).join(', '),
        birthday: emp?.DateOfBirth || '',
        nic: emp?.NIC || '',
        role: emp?.role?.RoleName || '',
        employeeId: emp?.EmployeeID || '',
        username: emp?.Email || ''
      });
      setOriginalProfile({
        fullName: (emp?.FirstName || '') + ' ' + (emp?.LastName || ''),
        email: res.data.email || emp?.Email || '',
        phone: res.data.phone || '',
        address: [res.data.streetNo, res.data.streetLine, res.data.city, res.data.district, res.data.province, res.data.postalCode].filter(Boolean).join(', '),
        birthday: emp?.DateOfBirth || '',
        nic: emp?.NIC || '',
        role: emp?.role?.RoleName || '',
        employeeId: emp?.EmployeeID || '',
        username: emp?.Email || ''
      });
    }
    setLoading(false);
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const [FirstName, ...rest] = profile.fullName.split(' ');
    const LastName = rest.join(' ');

    // Validation
    if (!profile.nic) {
      showToast('NIC is required.', 'error');
      setLoading(false);
      return;
    }
    if (!employee.StartDate) {
      showToast('Start Date is missing. Please contact admin.', 'error');
      setLoading(false);
      return;
    }

    // Parse address
    const addressParts = profile.address.split(',').map(s => s.trim());
    const [streetNo, streetLine, city, district, province, postalCode] = [addressParts[0]||'', addressParts[1]||'', addressParts[2]||'', addressParts[3]||'', addressParts[4]||'', addressParts[5]||''];

    const employeeData = {
      FirstName,
      LastName,
      NIC: profile.nic,
      DateOfBirth: profile.birthday,
      StartDate: employee.StartDate,
      DepartmentID: employee.DepartmentID,
      RoleID: employee.RoleID,
      EmployeeTypeID: employee.EmployeeTypeID,
      JobID: employee.JobID,
      Email: profile.email,
      EmployeeID: employee.EmployeeID,
      ReportingManagerID: employee.ReportingManagerID || null,
      IsActive: employee.IsActive,
    };

    console.log('Updating employee with:', employeeData);

    const empRes = await updateEmployee(employee.EMPID, employeeData);

    if (!empRes.success) {
      console.log('Backend validation error:', empRes);
    }

    // Update contact info
    const contactRes = await updateContactInformation(employee.EMPID, {
      ...contact,
      email: profile.email,
      phone: profile.phone,
      streetNo,
      streetLine,
      city,
      district,
      province,
      postalCode,
    });

    setLoading(false);
    if (empRes.success && contactRes.success) {
      setIsEditing(false);
      showToast('Profile updated successfully', 'success');
      window.location.reload();
    } else {
      showToast('Failed to update profile', 'error');
    }
  };

  if (loading) return <Box sx={{textAlign:'center',marginTop:8}}><CircularProgress /></Box>;
  if (!employee) return <Typography>No profile data found.</Typography>;

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <AdminNav />
      <Box sx={{ flexGrow: 1, py: 8,px:35 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#941936', mb: 4, textAlign: 'center' }}>
            Profile
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Manage your personal and contact information below.
          </Typography>
        </Box>
        <Grid container columns={12} columnSpacing={4} sx={{ maxWidth: 900, mx: 'auto' }}>
          {/* Profile Card - Left Side */}
          <Grid gridColumn="span 4">
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
                  {profile.fullName.charAt(0)}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                  {profile.fullName}
                </Typography>
                <Chip label={profile.role || 'Admin'} sx={{ mb: 2, bgcolor: '#a60515', color: 'white', fontWeight: 600 }} />
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
          <Grid gridColumn="span 8">
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ color: '#941936', fontWeight: 700 }}>Personal & Contact Information</Typography>
                {!isEditing ? (
                  <Button variant="outlined" startIcon={<Edit />} onClick={handleEdit} sx={{ borderColor: '#a60515', color: '#a60515', fontWeight: 600, '&:hover': { borderColor: '#941936', color: '#941936' } }}>Edit</Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" startIcon={<Save />} onClick={handleSave} sx={{ bgcolor: '#a60515', fontWeight: 600, '&:hover': { bgcolor: '#941936' } }}>Save</Button>
                    <Button variant="outlined" startIcon={<Cancel />} onClick={handleCancel} sx={{ borderColor: '#a60515', color: '#a60515', fontWeight: 600, '&:hover': { borderColor: '#941936', color: '#941936' } }}>Cancel</Button>
                  </Box>
                )}
              </Box>
              <Grid container columns={12} columnSpacing={3} rowSpacing={3}>
                {/* Basic Info */}
                <Grid gridColumn="span 12">
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profile.fullName}
                    onChange={e => handleInputChange('fullName', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{ startAdornment: <Person sx={{ mr: 1, color: '#666' }} /> }}
                  />
                </Grid>
                <Grid gridColumn="span 6">
                  <TextField
                    fullWidth
                    label="Personal Email"
                    value={profile.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{ startAdornment: <Email sx={{ mr: 1, color: '#666' }} /> }}
                    placeholder="Not Provided"
                  />
                </Grid>
                <Grid gridColumn="span 6">
                  <TextField
                    fullWidth
                    label="Contact Number"
                    value={profile.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: '#666' }} /> }}
                  />
                </Grid>
                <Grid gridColumn="span 12">
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
                <Grid gridColumn="span 6">
                  <TextField
                    fullWidth
                    label="Birthday Date"
                    type="date"
                    value={profile.birthday}
                    onChange={e => handleInputChange('birthday', e.target.value)}
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ startAdornment: <Cake sx={{ mr: 1, color: '#666' }} /> }}
                  />
                </Grid>
                <Grid gridColumn="span 6">
                  <TextField
                    fullWidth
                    label="NIC"
                    value={profile.nic}
                    onChange={e => handleInputChange('nic', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{ startAdornment: <Badge sx={{ mr: 1, color: '#666' }} /> }}
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

export default Profile; 