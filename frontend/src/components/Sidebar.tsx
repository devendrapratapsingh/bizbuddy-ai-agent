import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Typography } from '@mui/material';
import { Home, Chat, Phone, AccountCircle, Settings, BarChart, Group, Info } from '@mui/icons-material';

const drawerWidth = 240;

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { socket } = useSocket();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: Home,
      path: '/dashboard'
    },
    {
      text: 'Conversations',
      icon: Chat,
      path: '/conversations'
    },
    {
      text: 'Voice Calls',
      icon: Phone,
      path: '/voice-calls'
    },
    {
      text: 'Leads',
      icon: BarChart,
      path: '/leads'
    },
    {
      text: 'Customers',
      icon: Group,
      path: '/customers'
    },
    {
      text: 'Settings',
      icon: Settings,
      path: '/settings'
    },
    {
      text: 'About',
      icon: Info,
      path: '/about'
    }
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Box sx={{ textAlign: 'center', padding: '20px 0', backgroundColor: 'primary.main' }}>
            <AccountCircle style={{ fontSize: 60, color: '#fff' }} />
            <Typography variant="h6" color="common.white" sx={{ mt: 2 }}>
              {user?.name || 'Business User'}
            </Typography>
            <Typography variant="body2" color="common.white" sx={{ mt: 1 }}>
              {user?.email}
            </Typography>
          </Box>

          <Divider />

          <List>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                             (item.path === '/dashboard' && location.pathname === '/');

              return (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={isActive}
                    sx={{
                      color: isActive ? 'primary.main' : 'text.primary',
                      '&:hover': {
                        backgroundColor: isActive ? undefined : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </div>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" align="center">
            Version 1.0.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};