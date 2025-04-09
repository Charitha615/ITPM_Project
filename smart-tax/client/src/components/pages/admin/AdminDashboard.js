import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  AppBar, Toolbar, Typography, Container, Paper, Tabs, Tab, Box,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, Grid, IconButton, Menu, MenuItem, Avatar, 
  useTheme, useMediaQuery, LinearProgress, Snackbar, Alert,
  Card, CardContent, Divider, Button, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem as SelectMenuItem, TextareaAutosize
} from '@mui/material';
import {
  People, CheckCircle, Pending, PersonAdd, Logout,
  DarkMode, LightMode, Menu as MenuIcon, Search,
  Check, Close, Edit, Delete, Refresh, Category,
  InsertChart, PictureAsPdf, DateRange, FilterAlt
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersResponse = await api.get('/api/users');
      setUsers(usersResponse.data);
      
      // Fetch categories
      const categoriesResponse = await api.get('/api/tax-categories');
      setCategories(categoriesResponse.data);
      
      // Fetch analytics data
      const analyticsResponse = await api.get('/api/analytics');
      setAnalyticsData(analyticsResponse.data);
      
      // Calculate statistics
      const totalUsers = usersResponse.data.length;
      const approvedUsers = usersResponse.data.filter(u => u.isApproved).length;
      const totalCategories = categoriesResponse.data.length;
      const activeCategories = categoriesResponse.data.filter(c => c.is_active).length;
      
      setStats({
        totalUsers,
        approvedUsers,
        pendingUsers: totalUsers - approvedUsers,
        totalCategories,
        activeCategories
      });
      
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
      await api.patch(`/api/users/${endpoint}/${userId}`);
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
    } catch (err) {
      handleApiError(err, 'Failed to update category status');
    }
  };

  // Generate report
  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/analytics/report', reportConfig);
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
      navigate('/login');
    },
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
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

          <IconButton color="inherit" onClick={() => theme.palette.mode === 'dark' ? theme.setMode('light') : theme.setMode('dark')}>
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
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
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
                    {/* Chart would go here */}
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
                    {/* Chart would go here */}
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
                    {/* Chart would go here */}
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
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={reportConfig.startDate}
                    onChange={(date) => setReportConfig({...reportConfig, startDate: date})}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={reportConfig.endDate}
                    onChange={(date) => setReportConfig({...reportConfig, endDate: date})}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportConfig.reportType}
                  onChange={(e) => setReportConfig({...reportConfig, reportType: e.target.value})}
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