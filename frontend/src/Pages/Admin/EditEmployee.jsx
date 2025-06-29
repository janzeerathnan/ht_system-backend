import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, TextField, Button, Grid, Paper,
    MenuItem, FormControl, InputLabel, Select, Snackbar, Alert,
    CircularProgress
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import AdminNav from '../../navbars/AdminNav';

const EditEmployee = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const { employee: initialEmployee } = location.state || {};

    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Form data
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        EmployeeID: '',
        Email: '',
        Phone: '',
        NIC: '',
        DateOfBirth: '',
        StartDate: '',
        DepartmentID: '',
        RoleID: '',
        EmployeeTypeID: '',
        JobID: '',
        ReportingManagerID: ''
    });

    // Dropdown data
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [reportingManagers, setReportingManagers] = useState([]);

    useEffect(() => {
        if (initialEmployee) {
            setFormData({
                FirstName: initialEmployee.FirstName || '',
                LastName: initialEmployee.LastName || '',
                EmployeeID: initialEmployee.EmployeeID || '',
                Email: initialEmployee.Email || '',
                Phone: initialEmployee.Phone || '',
                NIC: initialEmployee.NIC || '',
                DateOfBirth: initialEmployee.DateOfBirth ? initialEmployee.DateOfBirth.split('T')[0] : '',
                StartDate: initialEmployee.StartDate ? initialEmployee.StartDate.split('T')[0] : '',
                DepartmentID: initialEmployee.DepartmentID || '',
                RoleID: initialEmployee.RoleID || '',
                EmployeeTypeID: initialEmployee.EmployeeTypeID || '',
                JobID: initialEmployee.JobID || '',
                ReportingManagerID: initialEmployee.ReportingManagerID || ''
            });
        }
        fetchDropdownData();
    }, [initialEmployee]);

    const fetchDropdownData = async () => {
        try {
            const [deptRes, rolesRes, typesRes, jobsRes, managersRes] = await Promise.all([
                axios.get('http://localhost:8000/api/dropdown/departments'),
                axios.get('http://localhost:8000/api/dropdown/roles'),
                axios.get('http://localhost:8000/api/dropdown/employee-types'),
                axios.get('http://localhost:8000/api/dropdown/jobs'),
                axios.get('http://localhost:8000/api/dropdown/reporting-managers')
            ]);

            setDepartments(deptRes.data);
            setRoles(rolesRes.data);
            setEmployeeTypes(typesRes.data);
            setJobs(jobsRes.data);
            setReportingManagers(managersRes.data);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSnackbar('Failed to load dropdown data', 'error');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await axios.put(`http://localhost:8000/api/employees/${id}`, formData);
            
            if (response.data.success) {
                showSnackbar('Employee updated successfully!');
                setTimeout(() => {
                    navigate('/admin/people');
                }, 1500);
            } else {
                showSnackbar('Failed to update employee', 'error');
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            showSnackbar('Failed to update employee', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    if (!initialEmployee) {
        return (
            <>
                <AdminNav />
                <div className="main-content">
                    <Container maxWidth="lg">
                        <Typography variant="h4" gutterBottom>
                            Employee not found
                        </Typography>
                        <Button variant="contained" onClick={() => navigate('/admin/people')}>
                            Back to People
                        </Button>
                    </Container>
                </div>
            </>
        );
    }

    return (
        <>
            <AdminNav />
            <div className="main-content">
                <Container maxWidth="lg">
                    <Typography variant="h4" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                        Edit Employee: {initialEmployee.FirstName} {initialEmployee.LastName}
                    </Typography>

                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    value={formData.FirstName}
                                    onChange={(e) => handleInputChange('FirstName', e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    value={formData.LastName}
                                    onChange={(e) => handleInputChange('LastName', e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Employee ID"
                                    value={formData.EmployeeID}
                                    onChange={(e) => handleInputChange('EmployeeID', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={formData.Email}
                                    onChange={(e) => handleInputChange('Email', e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={formData.Phone}
                                    onChange={(e) => handleInputChange('Phone', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="NIC"
                                    value={formData.NIC}
                                    onChange={(e) => handleInputChange('NIC', e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Date of Birth"
                                    type="date"
                                    value={formData.DateOfBirth}
                                    onChange={(e) => handleInputChange('DateOfBirth', e.target.value)}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Start Date"
                                    type="date"
                                    value={formData.StartDate}
                                    onChange={(e) => handleInputChange('StartDate', e.target.value)}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Department</InputLabel>
                                    <Select
                                        value={formData.DepartmentID}
                                        onChange={(e) => handleInputChange('DepartmentID', e.target.value)}
                                        label="Department"
                                    >
                                        {departments.map((dept) => (
                                            <MenuItem key={dept.DepartmentID} value={dept.DepartmentID}>
                                                {dept.DepartmentName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={formData.RoleID}
                                        onChange={(e) => handleInputChange('RoleID', e.target.value)}
                                        label="Role"
                                    >
                                        {roles.map((role) => (
                                            <MenuItem key={role.RoleID} value={role.RoleID}>
                                                {role.RoleName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Employee Type</InputLabel>
                                    <Select
                                        value={formData.EmployeeTypeID}
                                        onChange={(e) => handleInputChange('EmployeeTypeID', e.target.value)}
                                        label="Employee Type"
                                    >
                                        {employeeTypes.map((type) => (
                                            <MenuItem key={type.EmployeeTypeID} value={type.EmployeeTypeID}>
                                                {type.TypeName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Job Title</InputLabel>
                                    <Select
                                        value={formData.JobID}
                                        onChange={(e) => handleInputChange('JobID', e.target.value)}
                                        label="Job Title"
                                    >
                                        {jobs.map((job) => (
                                            <MenuItem key={job.JobID} value={job.JobID}>
                                                {job.JobTitle}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Reporting Manager</InputLabel>
                                    <Select
                                        value={formData.ReportingManagerID}
                                        onChange={(e) => handleInputChange('ReportingManagerID', e.target.value)}
                                        label="Reporting Manager"
                                    >
                                        <MenuItem value="">None</MenuItem>
                                        {reportingManagers.map((manager) => (
                                            <MenuItem key={manager.EMPID} value={manager.EMPID}>
                                                {manager.FirstName} {manager.LastName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/admin/people')}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                {loading ? 'Updating...' : 'Update Employee'}
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            </div>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default EditEmployee; 