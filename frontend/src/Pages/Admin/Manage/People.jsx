import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container, Box, Typography, Snackbar, Alert, Button,
    TextField, MenuItem, Stack, Paper, Dialog, DialogTitle,
    DialogContent, DialogActions, DialogContentText, Switch,
    Chip, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminNav from '../../../navbars/AdminNav';
import { toggleEmployeeActive } from '../../../api';

const EmployeeTable = ({ rows, onEdit, onDelete, onToggleStatus }) => {
    const columns = [
        { 
            field: 'EMPID', 
            headerName: 'ID', 
            width: 60,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600} color="primary">
                    {params.value || 'N/A'}
                </Typography>
            )
        },
        { 
            field: 'EmployeeID', 
            headerName: 'Employee ID', 
            width: 100,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.value || 'N/A'}
                </Typography>
            )
        },
        { 
            field: 'FirstName', 
            headerName: 'First Name', 
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.value || 'N/A'}
                </Typography>
            )
        },
        { 
            field: 'LastName', 
            headerName: 'Last Name', 
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={500}>
                    {params.value || 'N/A'}
                </Typography>
            )
        },
        { 
            field: 'Email', 
            headerName: 'Email', 
            width: 180,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary" sx={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                }}>
                    {params.value || 'N/A'}
                </Typography>
            )
        },
        {
            field: 'job', 
            headerName: 'Job Title', 
            width: 140,
            renderCell: (params) => {
                try {
                    // Access the job title directly from the row data
                    const jobTitle = params?.row?.job?.JobTitle;
                    return (
                        <Typography variant="body2" color="text.secondary" sx={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap' 
                        }}>
                            {jobTitle || 'N/A'}
                        </Typography>
                    );
                } catch (error) {
                    return (
                        <Typography variant="body2" color="text.secondary">
                            N/A
                        </Typography>
                    );
                }
            }
        },
        { 
            field: 'StartDate', 
            headerName: 'Start Date', 
            width: 100,
            renderCell: (params) => {
                let formatted = 'N/A';
                if (params.value) {
                    const date = new Date(params.value);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    formatted = `${day}/${month}/${year}`;
                }
                return (
                    <Typography variant="body2" color="text.secondary">
                        {formatted}
                    </Typography>
                );
            }
        },
        {
            field: 'IsActive',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => {
                const isActive = params.value;
                return (
                    <Chip
                        label={isActive ? 'Active' : 'Inactive'}
                        color={isActive ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                        sx={{
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            '& .MuiChip-label': {
                                px: 1,
                            }
                        }}
                    />
                );
            }
        },
        {
            field: 'actions', 
            headerName: 'Actions', 
            width: 200,
            sortable: false,
            renderCell: (params) => {
                try {
                    if (!params?.row) return null;
                    return (
                        <Stack direction="row" spacing={1} justifyContent="center" width="100%" alignItems="center">
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => onEdit(params.row)}
                                startIcon={<EditIcon />}
                                sx={{
                                    borderColor: '#1976d2',
                                    color: '#1976d2',
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    minWidth: 'auto',
                                    px: 1,
                                    '&:hover': {
                                        bgcolor: '#E3F2FD',
                                        borderColor: '#1565c0',
                                    }
                                }}
                            >
                                Edit
                            </Button>
                            <Tooltip title={params.row.IsActive ? 'Deactivate' : 'Activate'}>
                                <Switch
                                    checked={params.row.IsActive}
                                    onChange={(e) => onToggleStatus(params.row, e.target.checked)}
                                    size="small"
                                    color="success"
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#2e7d32',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#2e7d32',
                                        },
                                    }}
                                />
                            </Tooltip>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => onDelete(params.row)}
                                startIcon={<DeleteIcon />}
                                sx={{
                                    borderColor: '#d32f2f',
                                    color: '#d32f2f',
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    minWidth: 'auto',
                                    px: 1,
                                    '&:hover': {
                                        bgcolor: '#FFEBEE',
                                        borderColor: '#c62828',
                                    }
                                }}
                            >
                                Delete
                            </Button>
                        </Stack>
                    );
                } catch (error) {
                    return null;
                }
            }
        },
    ];

    // Ensure rows is always an array
    const safeRows = Array.isArray(rows) ? rows : [];

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <DataGrid
                rows={safeRows}
                columns={columns}
                getRowId={(row) => row?.EMPID || Math.random()}
                autoHeight
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #f0f0f0',
                        padding: '8px 16px',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#fafafa',
                        borderBottom: '2px solid #e0e0e0',
                        '& .MuiDataGrid-columnHeader': {
                            padding: '12px 16px',
                        }
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: '#f5f5f5',
                    },
                    '& .MuiDataGrid-virtualScroller': {
                        overflow: 'hidden',
                    },
                    '& .MuiDataGrid-main': {
                        overflow: 'hidden',
                    }
                }}
            />
        </Paper>
    );
};

const FiltersBar = ({
    searchTerm, setSearchTerm,
    selectedRole, setSelectedRole,
    selectedJob, setSelectedJob,
    selectedStatus, setSelectedStatus,
    roles, jobs, onAddClick
}) => (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', md: 'center' }}
            sx={{ flexWrap: 'wrap' }}
        >
            <TextField
                label="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ flex: 1, minWidth: 200 }}
                placeholder="Enter name or email to search..."
            />
            <TextField
                select
                label="Filter by Role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">All Roles</MenuItem>
                {roles.map((r) => (
                    <MenuItem key={r.RoleID} value={r.RoleID}>{r.RoleName}</MenuItem>
                ))}
            </TextField>
            <TextField
                select
                label="Filter by Job"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">All Jobs</MenuItem>
                {jobs.map((j) => (
                    <MenuItem key={j.JobID} value={j.JobID}>{j.JobTitle}</MenuItem>
                ))}
            </TextField>
            <TextField
                select
                label="Filter by Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
            >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
            </TextField>
            <Button
                variant="contained"
                onClick={onAddClick}
                sx={{
                    bgcolor: '#AE152D',
                    color: '#fff',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#8e1025' },
                    fontWeight: 500,
                    minWidth: 200,
                    height: 40,
                    px: 3,
                }}
            >
                + Onboard Employee
            </Button>
        </Stack>
    </Paper>
);

const People = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedJob, setSelectedJob] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, employee: null });

    // Fetch employees data
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/employees');
            if (response.data.success) {
                setEmployees(response.data.data);
            }
        } catch (error) {
            showSnackbar('Failed to load employees', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch dropdown data
    const fetchDropdownData = async () => {
        try {
            const [rolesRes, jobsRes] = await Promise.all([
                axios.get('http://localhost:8000/api/dropdown/roles'),
                axios.get('http://localhost:8000/api/dropdown/jobs')
            ]);
            setRoles(rolesRes.data);
            setJobs(jobsRes.data);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchDropdownData();
    }, []);

    const handleAddClick = () => navigate('/onboard');
    
    const handleEditClick = (employee) => {
        // Navigate to edit page with employee data
        navigate(`/admin/edit-employee/${employee.EMPID}`, { 
            state: { 
                employee,
                mode: 'edit'
            } 
        });
    };

    const handleDeleteClick = (employee) => {
        setDeleteDialog({ open: true, employee });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.employee) return;

        try {
            const response = await axios.delete(`http://localhost:8000/api/employees/${deleteDialog.employee.EMPID}`);
            if (response.data.success) {
                showSnackbar('Employee deleted successfully');
                fetchEmployees(); // Refresh the list
            } else {
                showSnackbar('Failed to delete employee', 'error');
            }
        } catch (error) {
            showSnackbar('Failed to delete employee', 'error');
        } finally {
            setDeleteDialog({ open: false, employee: null });
        }
    };

    const handleToggleStatus = async (employee, newStatus) => {
        try {
            const response = await toggleEmployeeActive(employee.EMPID, newStatus);
            if (response.success) {
                showSnackbar(`Employee ${newStatus ? 'activated' : 'deactivated'} successfully`);
                fetchEmployees(); // Refresh the list
            } else {
                showSnackbar('Failed to update employee status', 'error');
            }
        } catch (error) {
            showSnackbar('Failed to update employee status', 'error');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, employee: null });
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const filtered = employees
        .filter(e => {
            if (!e) return false;
            const fullName = `${e.FirstName || ''} ${e.LastName || ''}`.toLowerCase();
            const email = (e.Email || '').toLowerCase();
            const employeeId = (e.EmployeeID || '').toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            
            return fullName.includes(searchLower) ||
                   email.includes(searchLower) ||
                   employeeId.includes(searchLower);
        })
        .filter(e => {
            if (!e) return false;
            const roleMatch = !selectedRole || e.RoleID === parseInt(selectedRole);
            const jobMatch = !selectedJob || e.JobID === parseInt(selectedJob);
            const statusMatch = !selectedStatus || e.IsActive === (selectedStatus === 'true');
            return roleMatch && jobMatch && statusMatch;
        });

    return (
        <>
        <AdminNav />
        <div className="main-content">
            <Container maxWidth="xl">
                <Typography variant="h4" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                    People Directory
                </Typography>

                <FiltersBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedRole={selectedRole}
                    setSelectedRole={setSelectedRole}
                    selectedJob={selectedJob}
                    setSelectedJob={setSelectedJob}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    roles={roles}
                    jobs={jobs}
                    onAddClick={handleAddClick}
                />

                {loading ? (
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <Typography>Loading employees...</Typography>
                    </Paper>
                ) : filtered.length === 0 ? (
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            {employees.length === 0 ? 'No employees found' : 'No employees match your search criteria'}
                        </Typography>
                    </Paper>
                ) : (
                    <EmployeeTable
                        rows={filtered}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onToggleStatus={handleToggleStatus}
                    />
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialog.open}
                    onClose={handleDeleteCancel}
                    aria-labelledby="delete-dialog-title"
                    aria-describedby="delete-dialog-description"
                >
                    <DialogTitle id="delete-dialog-title">
                        Confirm Delete Employee
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="delete-dialog-description">
                            Are you sure you want to delete{' '}
                            <strong>
                                {deleteDialog.employee ? 
                                    `${deleteDialog.employee.FirstName} ${deleteDialog.employee.LastName}` : 
                                    'this employee'
                                }
                            </strong>?
                            <br />
                            <br />
                            This action cannot be undone. All associated data including contact information and user account will be permanently deleted.
                            <br />
                            <br />
                            <strong>Note:</strong> Inactive employees cannot log into the system. If you want to temporarily disable access, use the status toggle instead of deleting.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteCancel} color="primary">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleDeleteConfirm} 
                            color="error" 
                            variant="contained"
                            autoFocus
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </div>
        </>
    );
};

export default People;
