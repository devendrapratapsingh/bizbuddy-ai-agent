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
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid credentials or server error'
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
        width={400}
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
          Sign in to your account
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="outlined"
              size="medium"
            />
          </Box>

          <Box mb={3}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Box>
        </form>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Don't have an account?
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate('/register')}
              size="small"
            >
              Register here
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};