import React from 'react';
import {
  Box, TextField, FormControl, FormHelperText,
  InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const UserInfo = ({ form, formErrors, handleChange, setForm }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    <Box>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Username or Email"
          name="usernameOrEmail"
          value={form.usernameOrEmail || ''}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
          error={!!formErrors.usernameOrEmail}
          helperText={formErrors.usernameOrEmail}
        />
      </FormControl>

      <FormControl fullWidth margin="normal">
        <TextField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={form.password || ''}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
          error={!!formErrors.password}
          helperText={formErrors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </FormControl>

      <FormControl fullWidth margin="normal">
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={form.confirmPassword || ''}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
          error={!!formErrors.confirmPassword}
          helperText={formErrors.confirmPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </FormControl>
    </Box>
  );
};

export default UserInfo;
