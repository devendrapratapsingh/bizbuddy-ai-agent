import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

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
  Badge
} from '@mui/material';
import {
  TrendingUp,
  ChatBubble,
  Phone,
  AccountCircle,
  BarChart,
  Group,
  MoreVert,
  Notifications
} from '@mui/icons-material';

export const DashboardPage = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API calls
        const mockData = {
          leads: [
            { id: '1', name: 'John Doe', score: 0.85, conversionProbability: 0.75, lastContact: '2 hours ago' },
            { id: '2', name: 'Jane Smith', score: 0.72, conversionProbability: 0.65, lastContact: '5 hours ago' },
            { id: '3', name: 'Bob Johnson', score: 0.68, conversionProbability: 0.60, lastContact: '1 day ago' }
          ],
          conversations: [
            { id: 'conv-1', customer: 'Alice Brown', channel: 'Chat', status: 'Open', lastMessage: '2 minutes ago' },
            { id: 'conv-2', customer: 'Charlie Wilson', channel: 'Voice', status: 'In Progress', lastMessage: '15 minutes ago' },
            { id: 'conv-3', customer: 'Diana Martinez', channel: 'Chat', status: 'Open', lastMessage: '30 minutes ago' }
          ],
          activeCalls: [
            { id: 'call-1', customer: 'Eve Davis', duration: '3:45', agent: 'Agent Smith' },
            { id: 'call-2', customer: 'Frank Lee', duration: '1:20', agent: 'Agent Johnson' }
          ],
          notifications: [
            { id: 'notif-1', type: 'new_lead', message: 'New qualified lead from John Doe', time: '5 minutes ago' },
            { id: 'notif-2', type: 'conversation', message: 'Conversation with Jane Smith', time: '30 minutes ago' },
            { id: 'notif-3', type: 'call', message: 'Missed call from Bob Johnson', time: '2 hours ago' }
          ]
        };

        setLeads(mockData.leads);
        setConversations(mockData.conversations);
        setActiveCalls(mockData.activeCalls);
        setNotifications(mockData.notifications);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleNewConversation = () => {
    navigate('/conversations/new');
  };

  const handleNewCall = () => {
    navigate('/voice-call/new');
  };

  const handleNotificationClick = (notification: any) => {
    // Handle notification click - navigate to relevant page
    console.log('Notification clicked:', notification);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new_conversation':
        handleNewConversation();
        break;
      case 'new_call':
        handleNewCall();
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  if (loading) {
    return (
      <Box padding={4}>
        <Typography variant="h4">Loading Dashboard...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Quick Actions */}
      <Box mb={4}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  New Conversation
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {conversations.length}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ChatBubble />}
                  onClick={() => handleQuickAction('new_conversation')}
                >
                  Start New
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Active Calls
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {activeCalls.length}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Phone />}
                  onClick={() => handleQuickAction('new_call')}
                >
                  Start New
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Qualified Leads
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {leads.filter(l => l.score >= 0.7).length}
                </Typography>
                <Chip
                  label="View All"
                  onClick={() => navigate('/leads')}
                  clickable
                  color="primary"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Open Conversations
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {conversations.filter(c => c.status === 'Open').length}
                </Typography>
                <Chip
                  label="View All"
                  onClick={() => navigate('/conversations')}
                  clickable
                  color="primary"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Conversations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Recent Conversations"
              action={
                <IconButton onClick={() => navigate('/conversations')}>
                  <MoreVert />
                </IconButton>
              }
            />
            <CardContent>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Channel</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Activity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conversations.slice(0, 5).map((conversation) => (
                      <TableRow
                        key={conversation.id}
                        hover
                        onClick={() => navigate(`/conversations/${conversation.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2 }}>
                              {conversation.customer.charAt(0)}
                            </Avatar>
                            <Typography noWrap>
                              {conversation.customer}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={conversation.channel}
                            size="small"
                            color={conversation.channel === 'Voice' ? 'secondary' : 'primary'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={conversation.status}
                            size="small"
                            color={conversation.status === 'Open' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>
                          {conversation.lastMessage}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Calls */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Active Calls"
              action={
                <IconButton onClick={() => navigate('/voice-calls')}>
                  <MoreVert />
                </IconButton>
              }
            />
            <CardContent>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Agent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeCalls.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2 }}>
                              {call.customer.charAt(0)}
                            </Avatar>
                            <Typography noWrap>
                              {call.customer}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {call.duration}
                        </TableCell>
                        <TableCell>
                          {call.agent}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Lead Pipeline */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Lead Pipeline"
              action={
                <IconButton onClick={() => navigate('/leads')}>
                  <MoreVert />
                </IconButton>
              }
            />
            <CardContent>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Conversion Probability</TableCell>
                      <TableCell>Last Contact</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leads.slice(0, 5).map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          {lead.name}
                        </TableCell>
                        <TableCell>
                          <LinearProgress
                            variant="determinate"
                            value={lead.score * 100}
                            color={lead.score >= 0.7 ? 'primary' : 'secondary'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(lead.score * 100)}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${Math.round(lead.conversionProbability * 100)}%`}
                            size="small"
                            color={lead.conversionProbability >= 0.6 ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>
                          {lead.lastContact}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notifications */}
      <Box mt={3}>
        <Card>
          <CardHeader
            title="Recent Notifications"
            action={
              <IconButton onClick={() => navigate('/notifications')}>
                <Badge badgeContent={notifications.length} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            }
          />
          <CardContent>
            <Box display="flex" flexDirection="column" gap={2}>
              {notifications.slice(0, 3).map((notification) => (
                <Box
                  key={notification.id}
                  display="flex"
                  alignItems="center"
                  cursor="pointer"
                  onClick={() => handleNotificationClick(notification)}
                  pb={2}
                  borderBottom={1}
                  borderColor="divider"
                >
                  <Chip
                    label={notification.type}
                    size="small"
                    color={
                      notification.type === 'new_lead' ? 'success' :
                      notification.type === 'conversation' ? 'primary' :
                      'warning'
                    }
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                  <Box flexGrow={1} />
                  <Typography variant="caption" color="text.secondary">
                    {notification.time}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};