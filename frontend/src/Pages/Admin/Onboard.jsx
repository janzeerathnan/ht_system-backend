import React, { useState } from 'react';
import {
    Avatar, Box, Button, Paper, Typography, Snackbar, Alert,
    Stack, Stepper, Step, StepLabel, Divider, CircularProgress
} from '@mui/material';
import axios from 'axios';
import AdminNav from '../../navbars/AdminNav';
import BasicInfo from './onboard/BasicInfo';
import ContactInfo from './onboard/ContactInfo';
import UserInfo from './onboard/UserInfo';
import { useToast } from '../../components/ToastProvider';

const steps = ['Basic Information', 'Contact Information', 'User Credentials'];

const Onboard = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        FirstName: '', LastName: '', EmployeeID: '', DepartmentID: '', RoleID: '', EmployeeTypeID: '',
        StartDate: '', ReportingManagerID: '', JobID: '', NIC: '', DateOfBirth: '',
        Email: '', Phone: '',
        phoneNumbers: [],
        streetNo: '', streetLine: '', city: '', district: '', province: '', postalCode: '',
        usernameOrEmail: '', password: '', confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const { showToast } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateBasicInfo = () => {
        const errors = {};
        if (!form.FirstName) errors.FirstName = 'First name is required';
        if (!form.LastName) errors.LastName = 'Last name is required';
        if (!form.EmployeeID) errors.EmployeeID = 'Employee ID is required';
        if (!form.Email) errors.Email = 'Email is required';
        if (!form.Phone) errors.Phone = 'Phone is required';
        if (!form.NIC) errors.NIC = 'NIC is required';
        if (!form.DateOfBirth) errors.DateOfBirth = 'Date of birth is required';
        if (!form.StartDate) errors.StartDate = 'Start date is required';
        if (!form.DepartmentID) errors.DepartmentID = 'Department is required';
        if (!form.RoleID) errors.RoleID = 'Role is required';
        if (!form.EmployeeTypeID) errors.EmployeeTypeID = 'Employee type is required';
        if (!form.JobID) errors.JobID = 'Job title is required';
        return errors;
    };

    const validateContactInfo = () => {
        const errors = {};
        if (!form.streetNo) errors.streetNo = 'Street number is required';
        if (!form.city) errors.city = 'City is required';
        if (!form.district) errors.district = 'District is required';
        if (!form.province) errors.province = 'Province is required';
        if (!form.postalCode) errors.postalCode = 'Postal code is required';
        return errors;
    };

    const validateUserInfo = () => {
        const errors = {};
        if (!form.usernameOrEmail) errors.usernameOrEmail = 'Username/Email is required';
        if (!form.password) errors.password = 'Password is required';
        if (!form.confirmPassword) errors.confirmPassword = 'Confirm password is required';
        if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        if (form.password && form.password.length < 6) errors.password = 'Password must be at least 6 characters';
        return errors;
    };

    const validateCurrentStep = () => {
        let errors = {};
        if (currentStep === 0) errors = validateBasicInfo();
        else if (currentStep === 1) errors = validateContactInfo();
        else if (currentStep === 2) errors = validateUserInfo();
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (!validateCurrentStep()) {
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handleSubmit = async () => {
        // Validate all steps before submitting
        const basicErrors = validateBasicInfo();
        const contactErrors = validateContactInfo();
        const userErrors = validateUserInfo();
        
        const allErrors = { ...basicErrors, ...contactErrors, ...userErrors };
        
        if (Object.keys(allErrors).length > 0) {
            setFormErrors(allErrors);
            showToast('Please fix all validation errors before submitting', 'error');
            return;
        }

        try {
            setLoading(true);
            
            // Prepare the complete onboarding payload
            const onboardingPayload = {
                // Basic Info (Employee)
                FirstName: form.FirstName,
                LastName: form.LastName,
                EmployeeID: form.EmployeeID,
                Email: form.Email,
                Phone: form.Phone,
                NIC: form.NIC,
                DateOfBirth: form.DateOfBirth,
                StartDate: form.StartDate,
                DepartmentID: parseInt(form.DepartmentID) || null,
                RoleID: parseInt(form.RoleID) || null,
                EmployeeTypeID: parseInt(form.EmployeeTypeID) || null,
                JobID: parseInt(form.JobID) || null,
                ReportingManagerID: form.ReportingManagerID ? parseInt(form.ReportingManagerID) : null,
                
                // Contact Info
                streetNo: form.streetNo,
                streetLine: form.streetLine,
                city: form.city,
                district: form.district,
                province: form.province,
                postalCode: form.postalCode,
                phoneNumbers: form.phoneNumbers,
                
                // User Info
                usernameOrEmail: form.usernameOrEmail,
                password: form.password,
                confirmPassword: form.confirmPassword
            };
            
            // console.log('Onboarding payload:', onboardingPayload);
            
            // Send all data to the unified onboarding endpoint
            const response = await axios.post('http://localhost:8000/api/onboarding', onboardingPayload);
            
            if (response.data.success) {
                showToast('Employee onboarded successfully!', 'success');
                // console.log('Onboarding response:', response.data);
                handleClear();
                setCurrentStep(0);
            } else {
                showToast(response.data.message || 'Onboarding failed!', 'error');
            }
        } catch (error) {
            console.error('Onboarding error:', error.response?.data);
            const errorMessage = error.response?.data?.message || 'Onboarding failed!';
            const validationErrors = error.response?.data?.errors;
            
            if (validationErrors) {
                // Show all validation errors
                const errorMessages = Object.values(validationErrors).flat();
                const errorText = errorMessages.join(', ');
                showToast(`Validation errors: ${errorText}`, 'error');
            } else {
                showToast(errorMessage, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setForm({
            FirstName: '', LastName: '', EmployeeID: '', DepartmentID: '', RoleID: '', EmployeeTypeID: '',
            StartDate: '', ReportingManagerID: '', JobID: '', NIC: '', DateOfBirth: '',
            Email: '', Phone: '',
            phoneNumbers: [],
            streetNo: '', streetLine: '', city: '', district: '', province: '', postalCode: '',
            usernameOrEmail: '', password: '', confirmPassword: ''
        });
        setFormErrors({});
    };

    const initials = `${form.FirstName?.[0] || ''}${form.LastName?.[0] || ''}`.toUpperCase();

    return (
        <>
        <AdminNav />
        <div className="main-content">
            <Box maxWidth="900px" mx="auto" my={4}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Stack spacing={2} alignItems="center" mb={3}>
                        <Avatar sx={{ bgcolor: '#941936', width: 64, height: 64 }}>{initials || '?'}</Avatar>
                        <Typography variant="h5">Onboard New Employee</Typography>
                    </Stack>

                    <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
                        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                    </Stepper>

                    {currentStep === 0 && (
                        <>
                            <Typography variant="h6" gutterBottom>Basic Information</Typography>
                            <Divider sx={{ mb: 3 }} />
                            <BasicInfo
                                form={form} 
                                formErrors={formErrors} 
                                handleChange={handleChange}
                                setForm={setForm}
                            />
                        </>
                    )}

                    {currentStep === 1 && (
                        <>
                            <Typography variant="h6" gutterBottom>Contact Information</Typography>
                            <Divider sx={{ mb: 3 }} />
                            <ContactInfo
                                form={form}
                                formErrors={formErrors}
                                handleChange={handleChange}
                                setForm={setForm}
                            />
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <Typography variant="h6" gutterBottom>User Credentials</Typography>
                            <Divider sx={{ mb: 3 }} />
                            <UserInfo 
                                form={form} 
                                formErrors={formErrors}
                                handleChange={handleChange}
                                setForm={setForm}
                            />
                        </>
                    )}

                    <Box mt={4} display="flex" justifyContent="space-between">
                        <Button onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 0}>
                            ← Previous
                        </Button>
                        {currentStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                sx={{ bgcolor: '#AE152D', color: '#fff', '&:hover': { bgcolor: '#7F2F44' } }}
                                onClick={handleSubmit}
                                disabled={loading}
                                startIcon={loading && <CircularProgress size={20} />}
                            >
                                {loading ? 'Submitting...' : 'Submit →'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                sx={{ bgcolor: '#AE152D', color: '#fff', '&:hover': { bgcolor: '#7F2F44' } }}
                                onClick={handleNext}
                            >
                                Next →
                            </Button>
                        )}
                    </Box>
                </Paper>
            </Box>
        </div>
        </>
    );
};

export default Onboard;
