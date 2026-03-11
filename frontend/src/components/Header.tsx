import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Badge } from '@mui/material';
import { Notifications, AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import { styled } from '@emotion/react';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  padding: '0 20px',
  [theme.breakpoints.up('md')]: {
    padding: '0 30px',
  },
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '18px',
  color: '#fff',
  textDecoration: 'none',
  marginRight: '20px',
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  marginTop: '24px',
  minWidth: '200px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
}));

export const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { socket } = useSocket();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  if (!isAuthenticated) {
    return (
      <AppBar position="static" color="primary" elevation={0}>
        <StyledToolbar>
          <Logo variant="h6" component="div">
            BizBuddy
          </Logo>
        </StyledToolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <StyledToolbar>
        <Logo variant="h6" component="div">
          BizBuddy
        </Logo>

        <div style={{ flexGrow: 1 }} />

        <Badge
          badgeContent={0}
          color="secondary"
          style={{ marginRight: 20 }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Notifications style={{ color: '#fff' }} />
        </Badge>

        <IconButton
          color="inherit"
          aria-label="account menu"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenuOpen}
        >
          <AccountCircle style={{ color: '#fff' }} />
        </IconButton>

        <StyledMenu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleDashboard}>
            <Typography variant="body2">Dashboard</Typography>
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <Typography variant="body2">Settings</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Typography variant="body2">Logout</Typography>
          </MenuItem>
        </StyledMenu>
      </StyledToolbar>
    </AppBar>
  );
};