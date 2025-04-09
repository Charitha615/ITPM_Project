import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Visibility } from '@mui/icons-material';
import {
  AppBar, Toolbar, Typography, Container, Paper, Tabs, Tab, Box,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, Grid, IconButton, Menu, MenuItem, Avatar,
  useTheme, useMediaQuery, LinearProgress, Snackbar, Alert,
  Card, CardContent, Divider, Button, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem as SelectMenuItem, TextareaAutosize, DialogContentText
} from '@mui/material';
import {
  People, CheckCircle, Pending, PersonAdd, Logout,
  DarkMode, LightMode, Menu as MenuIcon, Search,
  Check, Close, Edit, Delete, Refresh, Category,
  InsertChart, PictureAsPdf, DateRange, FilterAlt
} from '@mui/icons-material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFDocument } from './PDFDocument.js';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

// Styled Components
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 30, 40, 0.7)'
    : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  boxShadow: theme.shadows[10],
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3)
}));

// Reusable components
const SectionHeader = ({ title }) => (
  <Typography variant="subtitle1" sx={{ 
    fontWeight: 600, 
    mb: 2,
    color: 'text.secondary',
    borderBottom: '2px solid',
    borderColor: 'divider',
    pb: 0.5 
  }}>
    {title}
  </Typography>
);

const InfoRow = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body2" sx={{ 
      fontWeight: 500, 
      color: 'text.secondary',
      mb: 0.5 
    }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 400 }}>
      {value || '-'}
    </Typography>
  </Box>
);

// Custom DatePicker input to match MUI style
const CustomDatePickerInput = React.forwardRef(({ value, onClick, ...props }, ref) => (
  <TextField
    fullWidth
    margin="normal"
    value={value}
    onClick={onClick}
    ref={ref}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <DateRange />
        </InputAdornment>
      ),
    }}
    {...props}
  />
));

const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  return (
    <GlassPaper>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: theme.palette[color].light,
              color: theme.palette[color].dark,
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </GlassPaper>
  );
};

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    approvedUsers: 0,
    pendingUsers: 0,
    totalCategories: 0,
    activeCategories: 0
  });
  const [analyticsData, setAnalyticsData] = useState({
    userRegistrations: [],
    categoryUsage: [],
    revenueData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [reportConfig, setReportConfig] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
    reportType: 'summary',
    filters: {}
  });
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfConfig, setPdfConfig] = useState({
    title: 'Analytics Report',
    includeCharts: true,
    includeTables: true
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users
      const usersResponse = await api.get('/api/users');
      setUsers(usersResponse.data);

      // Calculate statistics
      const totalUsers = usersResponse.data.length;
      const approvedUsers = usersResponse.data.filter(u => u.isApproved === 1).length; // Changed to check for 1

      setStats({
        ...stats,
        totalUsers,
        approvedUsers,
        pendingUsers: totalUsers - approvedUsers
      });

      // Fetch categories
      const categoriesResponse = await api.get('/api/tax-categories'); 
      setCategories(categoriesResponse.data);

      // Update category stats
      const totalCategories = categoriesResponse.data.length;
      const activeCategories = categoriesResponse.data.filter(c => c.is_active).length;

      setStats(prev => ({
        ...prev,
        totalCategories,
        activeCategories
      }));

      // Fetch analytics data
      const analyticsResponse = await api.get('/analytics'); 
      setAnalyticsData(analyticsResponse.data);

      setError(null);
    } catch (err) {
      handleApiError(err, 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Handle user approval
  const handleApproveUser = async (userId, approve) => {
    try {
      const endpoint = approve ? 'approve' : 'reject';
      await api.patch(`/api/users/${endpoint}/${userId}`); // Changed from '/api/users' to '/users'
      setSuccess(`User ${approve ? 'approved' : 'rejected'} successfully!`);
      fetchData();
    } catch (err) {
      handleApiError(err, `Failed to ${approve ? 'approve' : 'reject'} user`);
    }
  };

  // Handle category status toggle
  const toggleCategoryStatus = async (category) => {
    try {
      const updatedCategory = { ...category, is_active: !category.is_active };
      const response = await api.put(`/api/tax-categories/${category.id}`, updatedCategory); 
      setCategories(categories.map(cat =>
        cat.id === category.id ? response.data : cat
      ));
      setSuccess(`Category ${updatedCategory.is_active ? 'activated' : 'deactivated'}!`);

      // Update stats
      const activeCategories = updatedCategory.is_active ?
        stats.activeCategories + 1 : stats.activeCategories - 1;
      setStats(prev => ({
        ...prev,
        activeCategories
      }));
    } catch (err) {
      handleApiError(err, 'Failed to update category status');
    }
  };

  // Generate report
  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await api.post('/analytics/report', reportConfig); // Changed from '/api/analytics/report' to '/analytics/report'
      return response.data;
    } catch (err) {
      handleApiError(err, 'Failed to generate report');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handle API errors
  const handleApiError = (err, defaultMessage) => {
    const errorMessage = err.response?.data?.message || defaultMessage;
    setError(errorMessage);
    console.error(errorMessage, err);

    if (err.response?.status === 401) {
      authApi.logout();
    }
  };

  // API functions
  const authApi = {
    logout: () => {
      localStorage.removeItem('token');
      navigate('/');
    },
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Set up interceptors and initial data fetch
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    fetchData();

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [navigate]);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: theme.palette.mode === 'dark'
        ? 'radial-gradient(circle at center, #1a1a2e 0%, #16213e 70%, #0f3460 100%)'
        : 'radial-gradient(circle at center, #f5f7fa 0%, #e4e8f0 70%, #d0d7e2 100%)'
    }}>
      {/* App Bar */}
      <AppBar position="static" elevation={0} sx={{
        background: 'transparent',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" component="div" sx={{
            flexGrow: 1,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            ADMIN DASHBOARD
          </Typography>

          <IconButton color="inherit">
            {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>

          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{
              width: 36,
              height: 36,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
            }}>
              A
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={authApi.logout}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {/* Loading Indicator */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Notifications */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
          <Alert severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>

        {/* Main Content */}
        <GlassPaper>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab label="Users" icon={<People />} iconPosition="start" />
            <Tab label="Tax Categories" icon={<Category />} iconPosition="start" />
            <Tab label="Analytics" icon={<InsertChart />} iconPosition="start" />
          </Tabs>
        </GlassPaper>

        {activeTab === 0 && (
          <Box>
            {/* User Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon={<People fontSize="large" />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard
                  title="Approved Users"
                  value={stats.approvedUsers}
                  icon={<CheckCircle fontSize="large" />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard
                  title="Pending Approval"
                  value={stats.pendingUsers}
                  icon={<Pending fontSize="large" />}
                  color="warning"
                />
              </Grid>
            </Grid>

            {/* User Management */}
            <GlassPaper>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">User Management</Typography>
                <Box display="flex" gap={2}>
                  <TextField
                    size="small"
                    placeholder="Search users..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      )
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Refresh />}
                    onClick={fetchData}
                  >
                    Refresh
                  </Button>
                </Box>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Registered</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.isApproved ? 'Approved' : 'Pending'}
                            color={user.isApproved ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewDetails(user)}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            color={user.isApproved ? 'error' : 'success'}
                            onClick={() => handleApproveUser(user.id, !user.isApproved)}
                          >
                            {user.isApproved ? <Close /> : <Check />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* User Details Dialog */}
              <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                  sx: { borderRadius: 3 }
                }}
              >
                <DialogTitle sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box display="flex" alignItems="center">
                    {/* <Person fontSize="medium" sx={{ mr: 1.5 }} /> */}
                    User Profile
                  </Box>
                  <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'white' }}>
                    <Close />
                  </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                  {selectedUser && (
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      {/* Left Column */}
                      <Grid item xs={12} md={6}>
                        <SectionHeader title="Personal Information" />
                        <InfoRow label="Full Name" value={selectedUser.name} />
                        <InfoRow label="Email" value={selectedUser.email} />
                        <InfoRow label="Contact Number" value={selectedUser.contact_number} />
                        <InfoRow label="Gender" value={selectedUser.gender} />
                        <InfoRow label="Nationality" value={selectedUser.nationality} />
                      </Grid>

                      {/* Right Column */}
                      <Grid item xs={12} md={6}>
                        <SectionHeader title="Account Details" />
                        <InfoRow label="User Role" value={selectedUser.role} />
                        <InfoRow label="Registration Date"
                          value={new Date(selectedUser.created_at).toLocaleString()} />
                        <InfoRow label="ID Number" value={selectedUser.id_number} />
                        <InfoRow label="Address" value={selectedUser.address} />

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500, mr: 1 }}>
                            Status:
                          </Typography>
                          <Chip
                            label={selectedUser.isApproved ? 'Approved' : 'Pending'}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: 1,
                              borderWidth: 2,
                              borderColor: selectedUser.isApproved ? 'success.main' : 'warning.main',
                              color: selectedUser.isApproved ? 'success.dark' : 'warning.dark',
                              bgcolor: selectedUser.isApproved ? 'success.light' : 'warning.light'
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                </DialogContent>
              </Dialog>
            </GlassPaper>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {/* Tax Categories Statistics */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <StatCard
                  title="Total Categories"
                  value={stats.totalCategories}
                  icon={<Category fontSize="large" />}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StatCard
                  title="Active Categories"
                  value={stats.activeCategories}
                  icon={<CheckCircle fontSize="large" />}
                  color="success"
                />
              </Grid>
            </Grid>

            {/* Tax Categories Management */}
            <GlassPaper>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Tax Categories</Typography>
                <Box display="flex" gap={2}>
                  <TextField
                    size="small"
                    placeholder="Search categories..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      )
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Refresh />}
                    onClick={fetchData}
                  >
                    Refresh
                  </Button>
                </Box>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Tax Rate</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>{category.tax_percentage}%</TableCell>
                        <TableCell>
                          <Chip
                            label={category.is_active ? 'Active' : 'Inactive'}
                            color={category.is_active ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {category.description}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color={category.is_active ? 'error' : 'success'}
                            onClick={() => toggleCategoryStatus(category)}
                          >
                            {category.is_active ? <Close /> : <Check />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </GlassPaper>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            {/* Analytics Dashboard */}
            <GlassPaper>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Analytics Dashboard</Typography>
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FilterAlt />}
                    onClick={() => setPdfDialogOpen(true)}
                  >
                    Generate Report
                  </Button>
                </Box>
              </Box>

              {/* Analytics Charts Placeholder */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <GlassPaper>
                    <Typography variant="h6" gutterBottom>
                      User Registrations
                    </Typography>
                    <Box height={300} bgcolor="action.hover" display="flex" alignItems="center" justifyContent="center">
                      <Typography>User Registration Chart</Typography>
                    </Box>
                  </GlassPaper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <GlassPaper>
                    <Typography variant="h6" gutterBottom>
                      Category Usage
                    </Typography>
                    <Box height={300} bgcolor="action.hover" display="flex" alignItems="center" justifyContent="center">
                      <Typography>Category Usage Chart</Typography>
                    </Box>
                  </GlassPaper>
                </Grid>
                <Grid item xs={12}>
                  <GlassPaper>
                    <Typography variant="h6" gutterBottom>
                      Revenue Data
                    </Typography>
                    <Box height={400} bgcolor="action.hover" display="flex" alignItems="center" justifyContent="center">
                      <Typography>Revenue Data Chart</Typography>
                    </Box>
                  </GlassPaper>
                </Grid>
              </Grid>
            </GlassPaper>
          </Box>
        )}
      </Container>

      {/* PDF Generation Dialog */}
      <Dialog open={pdfDialogOpen} onClose={() => setPdfDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate PDF Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <DatePicker
                  selected={reportConfig.startDate}
                  onChange={(date) => setReportConfig({ ...reportConfig, startDate: date })}
                  customInput={<CustomDatePickerInput label="Start Date" />}
                  selectsStart
                  startDate={reportConfig.startDate}
                  endDate={reportConfig.endDate}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <DatePicker
                  selected={reportConfig.endDate}
                  onChange={(date) => setReportConfig({ ...reportConfig, endDate: date })}
                  customInput={<CustomDatePickerInput label="End Date" />}
                  selectsEnd
                  startDate={reportConfig.startDate}
                  endDate={reportConfig.endDate}
                  minDate={reportConfig.startDate}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportConfig.reportType}
                  onChange={(e) => setReportConfig({ ...reportConfig, reportType: e.target.value })}
                  label="Report Type"
                >
                  <SelectMenuItem value="summary">Summary Report</SelectMenuItem>
                  <SelectMenuItem value="detailed">Detailed Report</SelectMenuItem>
                  <SelectMenuItem value="custom">Custom Report</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>PDF Options</InputLabel>
                <TextareaAutosize
                  minRows={3}
                  placeholder="Additional notes for the report..."
                  style={{ width: '100%', padding: '8px' }}
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPdfDialogOpen(false)}>Cancel</Button>
          <PDFDownloadLink
            document={
              <PDFDocument
                data={analyticsData}
                config={pdfConfig}
                reportConfig={reportConfig}
              />
            }
            fileName="analytics_report.pdf"
          >
            {({ loading }) => (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PictureAsPdf />}
                disabled={loading}
              >
                {loading ? 'Preparing document...' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;