import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'';
import { useAuth } from '../contexts/AuthContext';

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  TextField,
  Switch,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  CircularProgress
} from '@mui/material';
import {
  Settings,
  AccountCircle,
  Business,
  Security,
  Notifications,
  Language,
  Help,
  Logout,
  Save,
  Edit,
  Delete,
  Add,
  ArrowDropDown,
  ArrowDropUp,
  MoreVert
} from '@mui/icons-material';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userSettings, setUserSettings] = useState<any>({});
  const [businessSettings, setBusinessSettings] = useState<any>({});
  const [notificationSettings, setNotificationSettings] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Simulate fetching user and business settings
        const mockSettings = {
          user: {
            name: user?.name || 'John Doe',
            email: user?.email || 'john.doe@example.com',
            phone: '+1234567890',
            timeZone: 'America/New_York',
            language: 'en',
            avatar: '',
            role: user?.role || 'USER'
          },
          business: {
            name: 'Acme Corporation',
            domain: 'acme.com',
            description: 'Leading technology solutions provider',
            industry: 'Technology',
            size: '51-200 employees',
            website: 'https://acme.com',
            address: '123 Main St, New York, NY 10001',
            phone: '+1234567890',
            email: 'info@acme.com',
            logo: '',
            theme: {
              primaryColor: '#1976d2',
              secondaryColor: '#dc004e',
              logo: '',
              favicon: ''
            },
            features: {
              chat: true,
              voice: true,
              email: true,
              aiAssistant: true,
              leadScoring: true,
              pipelineManagement: true
            },
            integrations: [
              { id: 'slack', name: 'Slack', connected: true },
              { id: 'google-calendar', name: 'Google Calendar', connected: false },
              { id: 'salesforce', name: 'Salesforce', connected: false }
            ]
          },
          notifications: {
            email: {
              newLead: true,
              conversationAssigned: true,
              missedCall: true,
              dailySummary: false
            },
            push: {
              newLead: true,
              conversationAssigned: true,
              missedCall: true,
              dailySummary: false
            },
            sms: {
              newLead: false,
              conversationAssigned: false,
              missedCall: true,
              dailySummary: false
            }
          },
          preferences: {
            autoArchive: false,
            showNotifications: true,
            darkMode: false,
            compactView: false,
            confirmDeletions: true
          }
        };

        setUserSettings(mockSettings.user);
        setBusinessSettings(mockSettings.business);
        setNotificationSettings(mockSettings.notifications);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Simulate saving settings
      console.log('Saving settings:', {
        userSettings,
        businessSettings,
        notificationSettings
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box padding={4}>
        <Typography variant="h4">Loading Settings...</Typography>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding={4}>
        <Typography variant="h4" color="error">
          {error}
        </Typography>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {/* User Profile */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="User Profile"
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {userSettings.name.charAt(0)}
            </Avatar>
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={userSettings.name}
                onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={userSettings.email}
                onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={userSettings.phone}
                onChange={(e) => setUserSettings(prev => ({ ...prev, phone: e.target.value }))}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Time Zone</InputLabel>
                <Select
                  value={userSettings.timeZone}
                  label="Time Zone"
                  onChange={(e) => setUserSettings(prev => ({ ...prev, timeZone: e.target.value as string }))}
                >
                  <SelectMenuItem value="America/New_York">Eastern Time (US & Canada)</SelectMenuItem>
                  <SelectMenuItem value="America/Chicago">Central Time (US & Canada)</SelectMenuItem>
                  <SelectMenuItem value="America/Denver">Mountain Time (US & Canada)</SelectMenuItem>
                  <SelectMenuItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectMenuItem>
                  <SelectMenuItem value="UTC">UTC</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={userSettings.language}
                  label="Language"
                  onChange={(e) => setUserSettings(prev => ({ ...prev, language: e.target.value as string }))}
                >
                  <SelectMenuItem value="en">English</SelectMenuItem>
                  <SelectMenuItem value="es">Spanish</SelectMenuItem>
                  <SelectMenuItem value="fr">French</SelectMenuItem>
                  <SelectMenuItem value="de">German</SelectMenuItem>
                  <SelectMenuItem value="zh">Chinese</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Business Settings" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Name"
                value={businessSettings.name}
                onChange={(e) => setBusinessSettings(prev => ({ ...prev, name: e.target.value }))}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Domain"
                value={businessSettings.domain}
                onChange={(e) => setBusinessSettings(prev => ({ ...prev, domain: e.target.value }))}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={businessSettings.description}
                onChange={(e) => setBusinessSettings(prev => ({ ...prev, description: e.target.value }))}
                variant="outlined"
                size="small"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  value={businessSettings.industry}
                  label="Industry"
                  onChange={(e) => setBusinessSettings(prev => ({ ...prev, industry: e.target.value as string }))}
                >
                  <SelectMenuItem value="Technology">Technology</SelectMenuItem>
                  <SelectMenuItem value="Finance">Finance</SelectMenuItem>
                  <SelectMenuItem value="Healthcare">Healthcare</SelectMenuItem>
                  <SelectMenuItem value="Retail">Retail</SelectMenuItem>
                  <SelectMenuItem value="Education">Education</SelectMenuItem>
                  <SelectMenuItem value="Real Estate">Real Estate</SelectMenuItem>
                  <SelectMenuItem value="Manufacturing">Manufacturing</SelectMenuItem>
                  <SelectMenuItem value="Professional Services">Professional Services</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Company Size</InputLabel>
                <Select
                  value={businessSettings.size}
                  label="Company Size"
                  onChange={(e) => setBusinessSettings(prev => ({ ...prev, size: e.target.value as string }))}
                >
                  <SelectMenuItem value="1-10">1-10 employees</SelectMenuItem>
                  <SelectMenuItem value="11-50">11-50 employees</SelectMenuItem>
                  <SelectMenuItem value="51-200">51-200 employees</SelectMenuItem>
                  <SelectMenuItem value="201-500">201-500 employees</SelectMenuItem>
                  <SelectMenuItem value="501-1000">501-1000 employees</SelectMenuItem>
                  <SelectMenuItem value="1000+">1000+ employees</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={businessSettings.website}
                onChange={(e) => setBusinessSettings(prev => ({ ...prev, website: e.target.value }))}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Phone"
                value={businessSettings.phone}
                onChange={(e) => setBusinessSettings(prev => ({ ...prev, phone: e.target.value }))}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Email"
                value={businessSettings.email}
                onChange={(e) => setBusinessSettings(prev => ({ ...prev, email: e.target.value }))}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={businessSettings.address}
                onChange={(e) => setBusinessSettings(prev => ({ ...prev, address: e.target.value }))}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Feature Toggles" />
        <CardContent>
          <Grid container spacing={3}>
            {Object.entries(businessSettings.features).map(([feature, enabled]) => (
              <Grid item xs={12} md={6} key={feature}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enabled}
                      onChange={(e) =>
                        setBusinessSettings(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            [feature]: e.target.checked
                          }
                        }))
                      }
                      name={feature}
                    />
                  }
                  label={feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Notification Settings" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Email Notifications
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(businessSettings.features).map(([feature, enabled]) => (
                  enabled && (
                    <Grid item xs={12} md={6} key={feature}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.email[feature as keyof typeof notificationSettings.email]}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({
                                ...prev,
                                email: {
                                  ...prev.email,
                                  [feature]: e.target.checked
                                }
                              }))
                            }
                            name={feature}
                          />
                        }
                        label={`${feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Notification`}
                      />
                    </Grid>
                  )
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Push Notifications
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(businessSettings.features).map(([feature, enabled]) => (
                  enabled && (
                    <Grid item xs={12} md={6} key={feature}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.push[feature as keyof typeof notificationSettings.push]}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({
                                ...prev,
                                push: {
                                  ...prev.push,
                                  [feature]: e.target.checked
                                }
                              }))
                            }
                            name={feature}
                          />
                        }
                        label={`${feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Notification`}
                      />
                    </Grid>
                  )
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                SMS Notifications
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(businessSettings.features).map(([feature, enabled]) => (
                  enabled && (
                    <Grid item xs={12} md={6} key={feature}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.sms[feature as keyof typeof notificationSettings.sms]}
                            onChange={(e) =>
                              setNotificationSettings(prev => ({
                                ...prev,
                                sms: {
                                  ...prev.sms,
                                  [feature]: e.target.checked
                                }
                              }))
                            }
                            name={feature}
                          />
                        }
                        label={`${feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Notification`}
                      />
                    </Grid>
                  )
                ))}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Preferences" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.darkMode || false}
                    onChange={(e) =>
                      setUserSettings(prev => ({ ...prev, darkMode: e.target.checked }))
                    }
                    name="darkMode"
                  />
                }
                label="Dark Mode"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.compactView || false}
                    onChange={(e) =>
                      setUserSettings(prev => ({ ...prev, compactView: e.target.checked }))
                    }
                    name="compactView"
                  />
                }
                label="Compact View"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.confirmDeletions || false}
                    onChange={(e) =>
                      setUserSettings(prev => ({ ...prev, confirmDeletions: e.target.checked }))
                    }
                    name="confirmDeletions"
                  />
                }
                label="Confirm Deletions"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.showNotifications || false}
                    onChange={(e) =>
                      setUserSettings(prev => ({ ...prev, showNotifications: e.target.checked }))
                    }
                    name="showNotifications"
                  />
                }
                label="Show Notifications"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Integrations" />
        <CardContent>
          <Grid container spacing={3}>
            {businessSettings.integrations.map((integration: any) => (
              <Grid item xs={12} md={6} key={integration.id}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={2}
                  bgcolor={integration.connected ? 'primary.lighter' : 'grey.100'}
                  borderRadius={4}
                  border={1}
                  borderColor={integration.connected ? 'primary.main' : 'divider'}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: integration.connected ? 'primary.main' : 'grey.300' }}>
                      {integration.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {integration.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {integration.connected ? 'Connected' : 'Not connected'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={integration.connected ? 'Connected' : 'Connect'}
                    size="small"
                    color={integration.connected ? 'success' : 'default'}
                    onClick={() => {
                      // Simulate connecting/disconnecting
                      setBusinessSettings(prev => ({
                        ...prev,
                        integrations: prev.integrations.map((int: any) =>
                          int.id === integration.id
                            ? { ...int, connected: !int.connected }
                            : int
                        )
                      }));
                    }}
                    clickable
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>

      {/* Danger Zone */}
      <Card sx={{ mt: 3 }}>
        <CardHeader title="Danger Zone" />
        <CardContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Be careful, these actions cannot be undone.
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Delete />}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  console.log('Account deletion initiated');
                  // In a real app, you would delete the account
                }
              }}
            >
              Delete Account
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              onClick={handleLogoutClick}
            >
              Logout
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};