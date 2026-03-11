import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
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
  CircularProgress
} from '@mui/material';
import {
  Phone,
  PhoneOutlined,
  CallMade,
  CallReceived,
  CallMissed,
  MoreVert,
  PlayArrow,
  Stop,
  Download
} from '@mui/icons-material';

export const VoiceCallsPage = () => {
  const navigate = useNavigate();
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCall, setSelectedCall] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockCalls = [
          {
            id: 'call-1',
            customerName: 'Alice Brown',
            customerPhone: '+1 (555) 123-4567',
            agentName: 'Agent Smith',
            status: 'completed',
            direction: 'inbound',
            duration: '5:32',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000 + 32 * 1000).toISOString(),
            recording: true
          },
          {
            id: 'call-2',
            customerName: 'Bob Johnson',
            customerPhone: '+1 (555) 987-6543',
            agentName: 'Agent Johnson',
            status: 'completed',
            direction: 'outbound',
            duration: '3:15',
            startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 4 * 60 * 60 * 1000 + 3 * 60 * 1000 + 15 * 1000).toISOString(),
            recording: true
          },
          {
            id: 'call-3',
            customerName: 'Charlie Wilson',
            customerPhone: '+1 (555) 456-7890',
            agentName: '',
            status: 'missed',
            direction: 'inbound',
            duration: '0:00',
            startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            endTime: null,
            recording: false
          },
          {
            id: 'call-4',
            customerName: 'Diana Martinez',
            customerPhone: '+1 (555) 234-5678',
            agentName: 'Agent Smith',
            status: 'in-progress',
            direction: 'outbound',
            duration: '2:45',
            startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            endTime: null,
            recording: true
          }
        ];

        setCalls(mockCalls);
      } catch (error) {
        console.error('Error fetching calls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, callId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCall(callId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCall(null);
  };

  const handleStartNewCall = () => {
    navigate('/voice-call/new');
  };

  const handleViewRecording = (call: any) => {
    console.log('View recording for call:', call.id);
    handleMenuClose();
  };

  const handleDownloadRecording = (call: any) => {
    console.log('Download recording for call:', call.id);
    handleMenuClose();
  };

  const getStatusIcon = (status: string, direction: string) => {
    if (status === 'completed') {
      return direction === 'inbound' ? <CallReceived color="success" /> : <CallMade color="primary" />;
    }
    if (status === 'missed') {
      return <CallMissed color="error" />;
    }
    if (status === 'in-progress') {
      return <Phone color="primary" />;
    }
    return <PhoneOutlined />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'missed': return 'error';
      case 'in-progress': return 'primary';
      default: return 'default';
    }
  };

  const formatDuration = (duration: string) => {
    // Already formatted as MM:SS
    return duration;
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Box padding={4}>
        <Typography variant="h4">Loading Voice Calls...</Typography>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box padding={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Voice Calls</Typography>
        <Button
          variant="contained"
          startIcon={<Phone />}
          onClick={handleStartNewCall}
        >
          Start New Call
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Calls
              </Typography>
              <Typography variant="h4">
                {calls.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4">
                {calls.filter(c => c.status === 'completed').length}
              </Typography>
              <Chip label="Established" size="small" color="success" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Missed
              </Typography>
              <Typography variant="h4">
                {calls.filter(c => c.status === 'missed').length}
              </Typography>
              <Chip label="Action needed" size="small" color="error" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4">
                {calls.filter(c => c.status === 'in-progress').length}
              </Typography>
              <Chip label="Active" size="small" color="primary" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Calls Table */}
      <Card>
        <CardHeader
          title="Call History"
          subheader={`${calls.length} calls total`}
          action={
            <IconButton>
              <MoreVert />
            </IconButton>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Direction</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Recording</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calls.map((call) => (
                  <TableRow key={call.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {call.customerName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {call.customerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {call.customerPhone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(call.status, call.direction)}
                        label={call.direction}
                        size="small"
                        color={call.direction === 'inbound' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      {call.agentName || (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDuration(call.duration)}</TableCell>
                    <TableCell>
                      <Chip
                        label={call.status.replace('-', ' ')}
                        size="small"
                        color={getStatusColor(call.status)}
                      />
                    </TableCell>
                    <TableCell>{formatTime(call.startTime)}</TableCell>
                    <TableCell>
                      {call.recording ? (
                        <Chip icon={<PlayArrow />} label="Available" size="small" color="success" />
                      ) : (
                        <Chip label="No recording" size="small" color="default" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, call.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {calls.find(c => c.id === selectedCall)?.recording && (
          <>
            <MenuItem onClick={() => handleViewRecording(calls.find(c => c.id === selectedCall))}>
              <PlayArrow fontSize="small" />
              <Typography variant="body2" sx={{ ml: 1 }}>Play Recording</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleDownloadRecording(calls.find(c => c.id === selectedCall))}>
              <Download fontSize="small" />
              <Typography variant="body2" sx={{ ml: 1 }}>Download Recording</Typography>
            </MenuItem>
          </>
        )}
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2">Close</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};