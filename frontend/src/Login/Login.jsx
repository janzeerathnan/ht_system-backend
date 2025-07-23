import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Link,
  Alert,
} from '@mui/material';
import axios from 'axios';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'ICST | Login';
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email: form.email.trim(),
        password: form.password
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('employee', JSON.stringify(response.data.data.employee));

        // Get role information
        const roleName = response.data.data.employee.role?.RoleName?.toLowerCase();
        const roleId = response.data.data.employee.role?.RoleID;

        // Route based on role
        if (roleName === 'admin' || roleName === 'hr') {
          // Admin or HR - go to Overview dashboard
          navigate('/overview');
        } else if (roleName === 'rm') {
          // Reporting Manager - go to EmployeeRM dashboard
          navigate('/employeerm');
        } else if (roleName === 'employee') {
          // Regular Employee - go to Employee dashboard
          navigate('/employee');
        } else {
          // Unknown role - show error
          setError('Invalid user role. Please contact your administrator.');
          // Clear stored data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('employee');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Login failed';

        switch (status) {
          case 401:
            // Check if it's a user not found or wrong password
            if (message.includes('Invalid credentials')) {
              // Try to determine if user exists
              try {
                // You could add an endpoint to check if user exists without revealing password
                setError('Invalid email or password. Please check your credentials.');
              } catch {
                setError('Invalid email or password. Please check your credentials.');
              }
            } else {
              setError(message);
            }
            break;
          case 403:
            setError('Your account has been deactivated. Please contact your administrator.');
            break;
          case 404:
            setError('User account not found. Please contact your administrator to create an account.');
            break;
          case 422:
            setError('Please provide valid email and password.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError('Login failed. Please try again.');
        }
      } else if (error.request) {
        // Network error
        setError('Network error. Please check your internet connection and try again.');
      } else {
        // Other error
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="#f5f6fa"
    >
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3, p: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" color="#941936" gutterBottom>
            Welcome Back
          </Typography>
          
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              required
              value={form.email}
              onChange={handleInputChange}
              disabled={loading}
              error={!!error}
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
              label="Password"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              required
              value={form.password}
              onChange={handleInputChange}
              disabled={loading}
              error={!!error}
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 2, 
                backgroundColor: '#941936', 
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { 
                  backgroundColor: '#7a0f2b' 
                },
                '&:disabled': {
                  backgroundColor: '#ccc'
                }
              }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?
            </Typography>
            <Link 
              component={RouterLink} 
              to="/" 
              underline="hover" 
              sx={{ 
                color: '#941936', 
                fontWeight: 'bold',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Contact your administrator
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;