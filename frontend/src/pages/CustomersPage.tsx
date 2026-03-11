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
  Group,
  Email,
  Phone,
  LocationOn,
  MoreVert,
  Message,
  History,
  TrendingUp
} from '@mui/icons-material';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockCustomers = [
          {
            id: 'cust-1',
            name: 'Alice Brown',
            email: 'alice.brown@example.com',
            phone: '+1 (555) 123-4567',
            company: 'TechCorp Inc',
            location: 'New York, NY',
            totalInteractions: 15,
            lastInteraction: '2 hours ago',
            satisfaction: 4.8,
            status: 'Active'
          },
          {
            id: 'cust-2',
            name: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            phone: '+1 (555) 987-6543',
            company: 'StartUp Labs',
            location: 'San Francisco, CA',
            totalInteractions: 8,
            lastInteraction: '1 day ago',
            satisfaction: 4.5,
            status: 'Active'
          },
          {
            id: 'cust-3',
            name: 'Charlie Wilson',
            email: 'charlie.wilson@example.com',
            phone: '+1 (555) 456-7890',
            company: 'Enterprise Solutions',
            location: 'Chicago, IL',
            totalInteractions: 25,
            lastInteraction: '3 days ago',
            satisfaction: 4.9,
            status: 'Premium'
          },
          {
            id: 'cust-4',
            name: 'Diana Martinez',
            email: 'diana.martinez@example.com',
            phone: '+1 (555) 234-5678',
            company: 'Agency XYZ',
            location: 'Miami, FL',
            totalInteractions: 5,
            lastInteraction: '1 week ago',
            satisfaction: 4.2,
            status: 'New'
          },
          {
            id: 'cust-5',
            name: 'Edward Kim',
            email: 'edward.kim@example.com',
            phone: '+1 (555) 876-5432',
            company: 'Digital Agency',
            location: 'Los Angeles, CA',
            totalInteractions: 12,
            lastInteraction: '5 hours ago',
            satisfaction: 4.7,
            status: 'Active'
          }
        ];

        setCustomers(mockCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, customerId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customerId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const handleViewProfile = () => {
    console.log('View customer profile:', selectedCustomer);
    handleMenuClose();
  };

  const handleViewHistory = () => {
    console.log('View customer history:', selectedCustomer);
    handleMenuClose();
  };

  const handleSendMessage = () => {
    console.log('Send message to:', selectedCustomer);
    handleMenuClose();
  };

  const handleCreateTask = () => {
    console.log('Create task for:', selectedCustomer);
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Premium': return 'primary';
      case 'New': return 'info';
      case 'Inactive': return 'default';
      default: return 'default';
    }
  };

  const getSatisfactionColor = (satisfaction: number) => {
    if (satisfaction >= 4.5) return 'success';
    if (satisfaction >= 4.0) return 'primary';
    return 'warning';
  };

  if (loading) {
    return (
      <Box padding={4}>
        <Typography variant="h4">Loading Customers...</Typography>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box padding={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Customer Management</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Group />}
          >
            Segments
          </Button>
          <Button
            variant="contained"
            startIcon={<TrendingUp />}
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
                Total Customers
              </Typography>
              <Typography variant="h4">
                {customers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Active
              </Typography>
              <Typography variant="h4">
                {customers.filter(c => c.status === 'Active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Premium
              </Typography>
              <Typography variant="h4">
                {customers.filter(c => c.status === 'Premium').length}
              </Typography>
              <Chip label="High value" size="small" color="primary" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Avg. Satisfaction
              </Typography>
              <Typography variant="h4">
                {customers.reduce((sum, c) => sum + c.satisfaction, 0) / customers.length.toFixed(1)}
              </Typography>
              <Chip
                label="Excellent"
                size="small"
                color="success"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customers Table */}
      <Card>
        <CardHeader
          title="All Customers"
          subheader={`${customers.length} customers`}
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
                  <TableCell>Company</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Interactions</TableCell>
                  <TableCell>Satisfaction</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {customer.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {customer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last: {customer.lastInteraction}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{customer.company}</TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Email fontSize="small" />
                          <Typography variant="caption">
                            {customer.email}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Phone fontSize="small" />
                          <Typography variant="caption">
                            {customer.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <LocationOn fontSize="small" />
                        <Typography variant="body2">
                          {customer.location}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${customer.totalInteractions} interactions`}
                        size="small"
                        color="default"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={(customer.satisfaction / 5) * 100}
                          color={getSatisfactionColor(customer.satisfaction)}
                          sx={{ width: 60 }}
                        />
                        <Typography variant="body2">
                          {customer.satisfaction}/5
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={customer.status}
                        size="small"
                        color={getStatusColor(customer.status)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, customer.id)}
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
        <MenuItem onClick={handleViewProfile}>
          <Typography variant="body2">View Profile</Typography>
        </MenuItem>
        <MenuItem onClick={handleViewHistory}>
          <Typography variant="body2">Interaction History</Typography>
        </MenuItem>
        <MenuItem onClick={handleSendMessage}>
          <Message fontSize="small" />
          <Typography variant="body2" sx={{ ml: 1 }}>Send Message</Typography>
        </MenuItem>
        <MenuItem onClick={handleCreateTask}>
          <Typography variant="body2">Create Task</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};