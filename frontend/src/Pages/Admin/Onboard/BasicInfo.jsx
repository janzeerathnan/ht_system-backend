import React, { useEffect, useState } from 'react';
import {
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Autocomplete
} from '@mui/material';
import axios from 'axios';

const BasicInfo = ({
  form, formErrors, handleChange, setForm
}) => {
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [managers, setManagers] = useState([]);
  const [managerQuery, setManagerQuery] = useState('');

  useEffect(() => {
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
        setJobTitles(jobsRes.data);
        setManagers(managersRes.data);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  const handleNICBlur = () => {
    const nic = form.nic;
    let year, day;

    if (/^\d{9}[vVxX]$/.test(nic)) {
      year = 1900 + parseInt(nic.substring(0, 2));
      day = parseInt(nic.substring(2, 5));
    } else if (/^\d{12}$/.test(nic)) {
      year = parseInt(nic.substring(0, 4));
      day = parseInt(nic.substring(4, 7));
    } else {
      return;
    }

    if (day > 500) day -= 500;
    const dob = new Date(year, 0);
    dob.setDate(day);
    const formattedDOB = dob.toISOString().slice(0, 10);

    setForm(prev => ({ ...prev, dob: formattedDOB }));
  };

  return (
    <Grid container columns={12} columnSpacing={2} rowSpacing={2}>
      <Grid style={{ gridColumn: 'span 6' }}>
        <TextField 
          fullWidth 
          label="First Name" 
          name="FirstName" 
          value={form.FirstName || ''} 
          onChange={handleChange} 
          error={!!formErrors.FirstName} 
          helperText={formErrors.FirstName} 
        />
      </Grid>
      <Grid style={{ gridColumn: 'span 6' }}>
        <TextField 
          fullWidth 
          label="Last Name" 
          name="LastName" 
          value={form.LastName || ''} 
          onChange={handleChange} 
          error={!!formErrors.LastName} 
          helperText={formErrors.LastName} 
        />
      </Grid>
      <Grid style={{ gridColumn: 'span 6' }}>
        <TextField 
          fullWidth 
          label="Employee ID" 
          name="EmployeeID" 
          value={form.EmployeeID || ''} 
          onChange={handleChange}
          placeholder="Auto-generated or manual entry"
        />
      </Grid>
      <Grid style={{ gridColumn: 'span 6' }}>
        <TextField 
          fullWidth 
          label="Email" 
          name="Email" 
          type="email"
          value={form.Email || ''} 
          onChange={handleChange}
          error={!!formErrors.Email} 
          helperText={formErrors.Email}
          placeholder="Enter email address"
        />
      </Grid>
      <Grid style={{ gridColumn: 'span 6' }}>
        <FormControl fullWidth error={!!formErrors.DepartmentID}>
          <InputLabel>Department</InputLabel>
          <Select name="DepartmentID" value={form.DepartmentID || ''} onChange={handleChange}>
            <MenuItem value="">Select Department</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.DepartmentID} value={dept.DepartmentID}>
                {dept.DepartmentName}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formErrors.DepartmentID}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid style={{ gridColumn: 'span 12' }}>
        <Autocomplete
          options={managers}
          getOptionLabel={(option) => `${option.FirstName} ${option.LastName}` || ''}
          inputValue={managerQuery}
          onInputChange={(e, v) => setManagerQuery(v)}
          onChange={(e, value) =>
            setForm(prev => ({ ...prev, ReportingManagerID: value?.EMPID || '' }))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Reporting Manager"
              error={!!formErrors.ReportingManagerID}
              helperText={formErrors.ReportingManagerID}
            />
          )}
        />
      </Grid>
      <Grid style={{ gridColumn: 'span 6' }}>
        <FormControl fullWidth error={!!formErrors.RoleID}>
          <InputLabel>Role</InputLabel>
          <Select name="RoleID" value={form.RoleID || ''} onChange={handleChange}>
            <MenuItem value="">Select Role</MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.RoleID} value={role.RoleID}>
                {role.RoleName}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formErrors.RoleID}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid style={{ gridColumn: 'span 6' }}>
        <FormControl fullWidth error={!!formErrors.EmployeeTypeID}>
          <InputLabel>Employee Type</InputLabel>
          <Select name="EmployeeTypeID" value={form.EmployeeTypeID || ''} onChange={handleChange}>
            <MenuItem value="">Select Type</MenuItem>
            {employeeTypes.map((type) => (
              <MenuItem key={type.EmployeeTypeID} value={type.EmployeeTypeID}>
                {type.TypeName}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formErrors.EmployeeTypeID}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid style={{ gridColumn: 'span 6' }}>
        <TextField
          fullWidth 
          type="date" 
          label="Start Date"
          name="StartDate" 
          value={form.StartDate || ''}
          onChange={handleChange} 
          InputLabelProps={{ shrink: true }}
          error={!!formErrors.StartDate} 
          helperText={formErrors.StartDate}
        />
      </Grid>
      <Grid style={{ gridColumn: 'span 6' }}>
        <FormControl fullWidth error={!!formErrors.JobID}>
          <InputLabel>Job Title</InputLabel>
          <Select name="JobID" value={form.JobID || ''} onChange={handleChange}>
            <MenuItem value="">Select Job</MenuItem>
            {jobTitles.map((job) => (
              <MenuItem key={job.JobID} value={job.JobID}>
                {job.JobTitle}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{formErrors.JobID}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid style={{ gridColumn: 'span 6' }}>
        <TextField
          fullWidth
          label="NIC"
          name="NIC"
          value={form.NIC || ''}
          onChange={handleChange}
          onBlur={handleNICBlur}
          error={!!formErrors.NIC}
          helperText={formErrors.NIC}
          placeholder="Enter NIC number"
        />
      </Grid>
      <Grid style={{ gridColumn: 'span 6' }}>
        <TextField
          fullWidth 
          type="date" 
          label="Date of Birth" 
          name="DateOfBirth"
          value={form.DateOfBirth || ''} 
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  );
};

export default BasicInfo;