import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(email, password, name);
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      backgroundColor="background.default"
      padding={4}
    >
      <Box
        width={450}
        maxWidth="100%"
        bgcolor="background.paper"
        border={1}
        borderColor="divider"
        borderRadius={4}
        boxShadow={2}
        p={4}
      >
        <Box display="flex" justifyContent="center" mb={3}>
          <Typography variant="h4" color="primary.main">
            BizBuddy
          </Typography>
        </Box>

        <Typography variant="h6" align="center" mb={4}>
          Create your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              variant="outlined"
              size="medium"
            />
          </Box>

          <Box mb={2}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="outlined"
              size="medium"
            />
          </Box>

          <Box mb={2}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variant="outlined"
              size="medium"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {/* Password strength indicator would go here */}
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box mb={3}>
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              variant="outlined"
              size="medium"
            />
          </Box>

          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </Box>
        </form>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Already have an account?
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate('/login')}
              size="small"
            >
              Sign in here
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};