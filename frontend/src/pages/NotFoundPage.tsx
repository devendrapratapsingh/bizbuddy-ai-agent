import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar
} from '@mui/material';
import { Home, Search } from '@mui/icons-material';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
      padding={4}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 500,
          width: '100%',
          borderRadius: 4
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 3,
            bgcolor: 'primary.main',
            fontSize: '3rem'
          }}
        >
          404
        </Avatar>

        <Typography variant="h4" gutterBottom color="text.primary">
          Page Not Found
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          The page you're looking for doesn't exist or has been moved.
          Please check the URL or return to the dashboard.
        </Typography>

        <Box
          display="flex"
          justifyContent="center"
          gap={2}
          mt={4}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Home />}
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>

          <Button
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<Search />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};