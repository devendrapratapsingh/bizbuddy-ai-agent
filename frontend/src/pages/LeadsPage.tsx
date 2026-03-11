import React, { useState, useEffect } from 'react';
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
  BarChart,
  TrendingUp,
  MoreVert,
  FilterList,
  Search,
  Download,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

export const LeadsPage = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockLeads = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            company: 'Acme Corp',
            score: 0.85,
            conversionProbability: 0.75,
            intent: 'Sales Inquiry',
            lastContact: '2 hours ago',
            status: 'Qualified'
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+1 (555) 987-6543',
            company: 'Tech Solutions',
            score: 0.72,
            conversionProbability: 0.65,
            intent: 'Product Demo',
            lastContact: '5 hours ago',
            status: 'In Progress'
          },
          {
            id: '3',
            name: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            phone: '+1 (555) 456-7890',
            company: 'StartUp Inc',
            score: 0.68,
            conversionProbability: 0.60,
            intent: 'Pricing Information',
            lastContact: '1 day ago',
            status: 'New'
          },
          {
            id: '4',
            name: 'Alice Brown',
            email: 'alice.brown@example.com',
            phone: '+1 (555) 234-5678',
            company: 'Enterprise Co',
            score: 0.92,
            conversionProbability: 0.88,
            intent: 'Partnership Discussion',
            lastContact: '30 minutes ago',
            status: 'Hot'
          },
          {
            id: '5',
            name: 'Charlie Wilson',
            email: 'charlie.wilson@example.com',
            phone: '+1 (555) 876-5432',
            company: 'Agency XYZ',
            score: 0.45,
            conversionProbability: 0.35,
            intent: 'General Inquiry',
            lastContact: '3 days ago',
            status: 'Cold'
          }
        ];

        setLeads(mockLeads);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, leadId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedLead(leadId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLead(null);
  };

  const handleViewLead = () => {
    console.log('View lead:', selectedLead);
    handleMenuClose();
  };

  const handleEditLead = () => {
    console.log('Edit lead:', selectedLead);
    handleMenuClose();
  };

  const handleDeleteLead = () => {
    console.log('Delete lead:', selectedLead);
    handleMenuClose();
  };

  const handleSendEmail = (lead: any) => {
    console.log('Send email to:', lead.email);
    // In a real app, this would open email client or send via API
  };

  const handleScheduleCall = (lead: any) => {
    console.log('Schedule call with:', lead.name);
    // In a real app, this would open scheduling interface
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'primary';
    return 'warning';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hot': return 'error';
      case 'Qualified': return 'success';
      case 'In Progress': return 'primary';
      case 'New': return 'info';
      case 'Cold': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box padding={4}>
        <Typography variant="h4">Loading Leads...</Typography>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box padding={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Lead Management</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<BarChart />}
          >
            View Analytics
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Leads
              </Typography>
              <Typography variant="h4">
                {leads.length}
              </Typography>
              <TrendingUp color="success" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Qualified Leads
              </Typography>
              <Typography variant="h4">
                {leads.filter(l => l.score >= 0.7).length}
              </Typography>
              <Chip
                label={`${Math.round((leads.filter(l => l.score >= 0.7).length / leads.length) * 100)}%`}
                size="small"
                color="success"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Average Score
              </Typography>
              <Typography variant="h4">
                {Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length * 100)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={leads.reduce((sum, l) => sum + l.score, 0) / leads.length * 100}
                color="primary"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h4">
                {Math.round(leads.reduce((sum, l) => sum + l.conversionProbability, 0) / leads.length * 100)}%
              </Typography>
              <Chip
                label="Target: 20%"
                size="small"
                color={leads.reduce((sum, l) => sum + l.conversionProbability, 0) / leads.length >= 0.2 ? 'success' : 'warning'}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leads Table */}
      <Card>
        <CardHeader
          title="All Leads"
          subheader={`${leads.length} leads found`}
          action={
            <IconButton>
              <Search />
            </IconButton>
          }
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Conversion</TableCell>
                  <TableCell>Intent</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Contact</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {lead.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {lead.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {lead.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={lead.score * 100}
                          color={getScoreColor(lead.score)}
                          sx={{ width: 60 }}
                        />
                        <Typography variant="body2">
                          {Math.round(lead.score * 100)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${Math.round(lead.conversionProbability * 100)}%`}
                        size="small"
                        color={lead.conversionProbability >= 0.6 ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>{lead.intent}</TableCell>
                    <TableCell>
                      <Chip
                        label={lead.status}
                        size="small"
                        color={getStatusColor(lead.status)}
                      />
                    </TableCell>
                    <TableCell>{lead.lastContact}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, lead.id)}
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
        <MenuItem onClick={handleViewLead}>
          <Typography variant="body2">View Details</Typography>
        </MenuItem>
        <MenuItem onClick={handleEditLead}>
          <Typography variant="body2">Edit</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleSendEmail(leads.find(l => l.id === selectedLead))}>
          <Typography variant="body2">Send Email</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleScheduleCall(leads.find(l => l.id === selectedLead))}>
          <Typography variant="body2">Schedule Call</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteLead} sx={{ color: 'error.main' }}>
          <Typography variant="body2" color="error">
            Delete
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};