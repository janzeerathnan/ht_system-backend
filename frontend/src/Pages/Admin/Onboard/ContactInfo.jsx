import React, { useState, useEffect } from 'react';
import {
  Grid, TextField, IconButton, Tooltip, Typography, Box, FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const ContactInfo = ({ form, formErrors, handleChange, setForm }) => {
  // Sri Lankan Provinces
  const provinces = [
    { id: 'Western', name: 'Western Province' },
    { id: 'Central', name: 'Central Province' },
    { id: 'Southern', name: 'Southern Province' },
    { id: 'Northern', name: 'Northern Province' },
    { id: 'Eastern', name: 'Eastern Province' },
    { id: 'North Western', name: 'North Western Province' },
    { id: 'North Central', name: 'North Central Province' },
    { id: 'Uva', name: 'Uva Province' },
    { id: 'Sabaragamuwa', name: 'Sabaragamuwa Province' }
  ];

  // Sri Lankan Districts by Province with default postal codes
  const districtsByProvince = {
    'Western': [
      { id: 'Colombo', name: 'Colombo', defaultPostalCode: '10000' },
      { id: 'Gampaha', name: 'Gampaha', defaultPostalCode: '11000' },
      { id: 'Kalutara', name: 'Kalutara', defaultPostalCode: '12000' }
    ],
    'Central': [
      { id: 'Kandy', name: 'Kandy', defaultPostalCode: '20000' },
      { id: 'Matale', name: 'Matale', defaultPostalCode: '21000' },
      { id: 'Nuwara Eliya', name: 'Nuwara Eliya', defaultPostalCode: '22000' }
    ],
    'Southern': [
      { id: 'Galle', name: 'Galle', defaultPostalCode: '80000' },
      { id: 'Matara', name: 'Matara', defaultPostalCode: '81000' },
      { id: 'Hambantota', name: 'Hambantota', defaultPostalCode: '82000' }
    ],
    'Northern': [
      { id: 'Jaffna', name: 'Jaffna', defaultPostalCode: '40000' },
      { id: 'Kilinochchi', name: 'Kilinochchi', defaultPostalCode: '41000' },
      { id: 'Mullaitivu', name: 'Mullaitivu', defaultPostalCode: '42000' },
      { id: 'Vavuniya', name: 'Vavuniya', defaultPostalCode: '43000' }
    ],
    'Eastern': [
      { id: 'Batticaloa', name: 'Batticaloa', defaultPostalCode: '30000' },
      { id: 'Ampara', name: 'Ampara', defaultPostalCode: '32000' },
      { id: 'Trincomalee', name: 'Trincomalee', defaultPostalCode: '31000' }
    ],
    'North Western': [
      { id: 'Kurunegala', name: 'Kurunegala', defaultPostalCode: '60000' },
      { id: 'Puttalam', name: 'Puttalam', defaultPostalCode: '61000' }
    ],
    'North Central': [
      { id: 'Anuradhapura', name: 'Anuradhapura', defaultPostalCode: '50000' },
      { id: 'Polonnaruwa', name: 'Polonnaruwa', defaultPostalCode: '51000' }
    ],
    'Uva': [
      { id: 'Badulla', name: 'Badulla', defaultPostalCode: '90000' },
      { id: 'Monaragala', name: 'Monaragala', defaultPostalCode: '91000' }
    ],
    'Sabaragamuwa': [
      { id: 'Ratnapura', name: 'Ratnapura', defaultPostalCode: '70000' },
      { id: 'Kegalle', name: 'Kegalle', defaultPostalCode: '71000' }
    ]
  };

  const [availableDistricts, setAvailableDistricts] = useState([]);

  // Update districts when province changes
  useEffect(() => {
    if (form.province) {
      const districts = districtsByProvince[form.province] || [];
      setAvailableDistricts(districts);
      
      // Clear district and postal code if province changes
      if (!districts.find(d => d.id === form.district)) {
        setForm(prev => ({ ...prev, district: '', postalCode: '' }));
      }
    } else {
      setAvailableDistricts([]);
      setForm(prev => ({ ...prev, district: '', postalCode: '' }));
    }
  }, [form.province, setForm]);

  // Auto-set postal code when district changes
  useEffect(() => {
    if (form.district && form.province) {
      const selectedDistrict = districtsByProvince[form.province]?.find(d => d.id === form.district);
      if (selectedDistrict) {
        // Automatically set the default postal code for the selected district
        setForm(prev => ({ ...prev, postalCode: selectedDistrict.defaultPostalCode }));
      }
    }
  }, [form.district, form.province, setForm]);

  const handleAddPhone = () => {
    setForm(prev => ({
      ...prev,
      phoneNumbers: [...(prev.phoneNumbers || []), '']
    }));
  };

  const handlePhoneChange = (index, value) => {
    const updated = [...(form.phoneNumbers || [])];
    updated[index] = value;
    setForm(prev => ({ ...prev, phoneNumbers: updated }));
  };

  const handleRemovePhone = (index) => {
    const updated = [...(form.phoneNumbers || [])];
    updated.splice(index, 1);
    setForm(prev => ({ ...prev, phoneNumbers: updated }));
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Phone */}
        <Grid style={{ gridColumn: 'span 6' }}>
          <TextField
            fullWidth
            name="Phone"
            label="Phone"
            value={form.Phone || ''}
            onChange={handleChange}
            error={!!formErrors.Phone}
            helperText={formErrors.Phone}
          />
        </Grid>

        <Grid style={{ gridColumn: 'span 12', marginRight: 100 }}>
        <Typography variant="subtitle1" fontWeight={600} mt={2}>
          Address
        </Typography>
      </Grid>

      {/* Address Fields */}
        <Grid style={{ gridColumn: 'span 6' }}>
        <TextField
          fullWidth
          name="streetNo"
          label="Street No."
          value={form.streetNo || ''}
          onChange={handleChange}
            error={!!formErrors.streetNo}
            helperText={formErrors.streetNo}
        />
      </Grid>
        
        <Grid style={{ gridColumn: 'span 6' }}>
        <TextField
          fullWidth
          name="streetLine"
          label="Street Name"
          value={form.streetLine || ''}
          onChange={handleChange}
            error={!!formErrors.streetLine}
            helperText={formErrors.streetLine}
        />
      </Grid>
        
        <Grid style={{ gridColumn: 'span 6' }}>
        <TextField
          fullWidth
          name="city"
          label="City"
          value={form.city || ''}
          onChange={handleChange}
            error={!!formErrors.city}
            helperText={formErrors.city}
        />
      </Grid>
        
        {/* Province Dropdown */}
        <Grid style={{ gridColumn: 'span 6' }}>
          <FormControl fullWidth error={!!formErrors.province}>
            <InputLabel>Province</InputLabel>
            <Select 
              name="province" 
              value={form.province || ''} 
              onChange={handleChange}
              label="Province"
            >
              <MenuItem value="">Select Province</MenuItem>
              {provinces.map((province) => (
                <MenuItem key={province.id} value={province.id}>
                  {province.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{formErrors.province}</FormHelperText>
          </FormControl>
        </Grid>
        
        {/* District Dropdown */}
        <Grid style={{ gridColumn: 'span 6' }}>
          <FormControl fullWidth error={!!formErrors.district}>
            <InputLabel>District</InputLabel>
            <Select 
          name="district"
          value={form.district || ''}
          onChange={handleChange}
              label="District"
              disabled={!form.province}
            >
              <MenuItem value="">Select District</MenuItem>
              {availableDistricts.map((district) => (
                <MenuItem key={district.id} value={district.id}>
                  {district.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{formErrors.district}</FormHelperText>
          </FormControl>
      </Grid>
        
        {/* Postal Code (Auto-filled, but editable) */}
        <Grid style={{ gridColumn: 'span 6' }}>
        <TextField
          fullWidth
          name="postalCode"
          label="Postal Code"
            value={form.postalCode || ''}
          onChange={handleChange}
            error={!!formErrors.postalCode}
            helperText={formErrors.postalCode || "Auto-filled based on district selection"}
            InputProps={{
              readOnly: false, // Allow editing if needed
            }}
          />
        </Grid>

        {/* Additional Phone Numbers */}
        {(form.phoneNumbers || []).map((number, index) => (
          <Grid style={{ gridColumn: 'span 6' }} key={index}>
            <TextField
              fullWidth
              label={`Additional Phone #${index + 1}`}
              type="tel"
              value={number}
              onChange={(e) => handlePhoneChange(index, e.target.value)}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Remove">
                    <IconButton 
                      onClick={() => handleRemovePhone(index)}
                    >
                      <RemoveCircleOutlineIcon color="error" />
                    </IconButton>
                  </Tooltip>
                )
              }}
            />
          </Grid>
        ))}

        {/* Add Phone Button */}
        <Grid style={{ gridColumn: 'span 12', marginTop: 8, marginBottom: 8 }}>
          <Tooltip title="Add another number">
            <IconButton 
              color="primary" 
              onClick={handleAddPhone}
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactInfo;
