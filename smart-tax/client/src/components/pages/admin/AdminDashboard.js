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
  Select, MenuItem as SelectMenuItem, TextareaAutosize
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
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    id: null,
    name: '',
    description: '',
    tax_percentage: '',
    is_active: 1
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    approvedUsers: 0,
    pendingUsers: 0,
    totalCategories: 0,
    activeCategories: 0
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
    title: 'Admin Report',
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
      const approvedUsers = usersResponse.data.filter(u => u.isApproved === 1).length;

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

  // Generate report data from existing state
  const generateReportData = () => {
    // Create user registration data
    const userRegistrations = users.map(user => ({
      date: new Date(user.created_at).toLocaleDateString(),
      count: 1
    }));

    // Create category usage data
    const categoryUsage = categories.map(category => ({
      name: category.name,
      count: category.tax_percentage
    }));

    return {
      userRegistrations,
      categoryUsage,
      stats
    };
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



  const CategoryFormDialog = () => (
    <Dialog
      open={categoryDialogOpen}
      onClose={() => setCategoryDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{
        bgcolor: 'primary.main',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2
      }}>
        {isEditMode ? 'Edit Tax Category' : 'Add New Tax Category'}
        <IconButton onClick={() => setCategoryDialogOpen(false)} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <form onSubmit={handleCategorySubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                required
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tax Percentage"
                type="number"
                value={currentCategory.tax_percentage}
                onChange={(e) => setCurrentCategory({ ...currentCategory, tax_percentage: e.target.value })}
                required
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={currentCategory.description}
                onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentCategory.is_active}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, is_active: e.target.value })}
                  label="Status"
                >
                  <MenuItem value={1}>Active</MenuItem>
                  <MenuItem value={0}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <DialogActions sx={{ mt: 2 }}>
            <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );

  const handleAddCategory = () => {
    setCurrentCategory({
      id: null,
      name: '',
      description: '',
      tax_percentage: '',
      is_active: 1
    });
    setIsEditMode(false);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setCurrentCategory({
      id: category.id,
      name: category.name,
      description: category.description,
      tax_percentage: category.tax_percentage,
      is_active: category.is_active
    });
    setIsEditMode(true);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await api.delete(`/api/tax-categories/${categoryId}`);
      setSuccess('Category deleted successfully!');
      fetchData();
    } catch (err) {
      handleApiError(err, 'Failed to delete category');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const categoryData = {
        name: currentCategory.name,
        description: currentCategory.description,
        tax_percentage: parseFloat(currentCategory.tax_percentage),
        is_active: currentCategory.is_active
      };

      if (isEditMode) {
        await api.put(`/api/tax-categories/${currentCategory.id}`, categoryData);
        setSuccess('Category updated successfully!');
      } else {
        await api.post('/api/tax-categories', categoryData);
        setSuccess('Category created successfully!');
      }

      setCategoryDialogOpen(false);
      fetchData();
    } catch (err) {
      handleApiError(err, `Failed to ${isEditMode ? 'update' : 'create'} category`);
    }
  };
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

          {/* <IconButton color="inherit">
            {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton> */}

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
            <Tab label="Reports" icon={<InsertChart />} iconPosition="start" />
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
                    startIcon={<PersonAdd />}
                    onClick={handleAddCategory}
                  >
                    Add Category
                  </Button>
                  <Button
                    variant="outlined"
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
                            color="primary"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Delete />
                          </IconButton>
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

            {/* Render the category form dialog */}
            {/* <CategoryFormDialog /> */}

            <Dialog
              open={categoryDialogOpen}
              onClose={() => setCategoryDialogOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle sx={{
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2
              }}>
                {isEditMode ? 'Edit Tax Category' : 'Add New Tax Category'}
                <IconButton onClick={() => setCategoryDialogOpen(false)} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ p: 3 }}>
                <form onSubmit={handleCategorySubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Category Name"
                        value={currentCategory.name}
                        onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                        required
                        margin="normal"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Tax Percentage"
                        type="number"
                        value={currentCategory.tax_percentage}
                        onChange={(e) => setCurrentCategory({ ...currentCategory, tax_percentage: e.target.value })}
                        required
                        margin="normal"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={currentCategory.description}
                        onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                        multiline
                        rows={3}
                        margin="normal"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={currentCategory.is_active}
                          onChange={(e) => setCurrentCategory({ ...currentCategory, is_active: e.target.value })}
                          label="Status"
                        >
                          <MenuItem value={1}>Active</MenuItem>
                          <MenuItem value={0}>Inactive</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <DialogActions sx={{ mt: 2 }}>
                    <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                      {isEditMode ? 'Update' : 'Create'}
                    </Button>
                  </DialogActions>
                </form>
              </DialogContent>
            </Dialog>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            {/* Reports Dashboard */}
            <GlassPaper>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">System Reports</Typography>
                {/* <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PictureAsPdf />}
                    onClick={() => setPdfDialogOpen(true)}
                  >
                    Generate PDF Report
                  </Button>
                </Box> */}
              </Box>

              {/* Summary Statistics */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <GlassPaper>
                    <Typography variant="h6" gutterBottom>
                      User Statistics
                    </Typography>
                    <Box>
                      <InfoRow label="Total Users" value={stats.totalUsers} />
                      <InfoRow label="Approved Users" value={stats.approvedUsers} />
                      <InfoRow label="Pending Users" value={stats.pendingUsers} />
                    </Box>
                  </GlassPaper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <GlassPaper>
                    <Typography variant="h6" gutterBottom>
                      Category Statistics
                    </Typography>
                    <Box>
                      <InfoRow label="Total Categories" value={stats.totalCategories} />
                      <InfoRow label="Active Categories" value={stats.activeCategories} />
                      <InfoRow label="Inactive Categories" value={stats.totalCategories - stats.activeCategories} />
                    </Box>
                  </GlassPaper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <GlassPaper>
                    <Typography variant="h6" gutterBottom>
                      Recent Activity
                    </Typography>
                    <Box>
                      <InfoRow
                        label="New Users (Last 30 days)"
                        value={
                          users.filter(u =>
                            new Date(u.created_at) > new Date(new Date().setDate(new Date().getDate() - 30))
                          ).length
                        }
                      />
                      <InfoRow
                        label="Updated Categories (Last 30 days)"
                        value={
                          categories.filter(c =>
                            new Date(c.updated_at) > new Date(new Date().setDate(new Date().getDate() - 30))
                          ).length
                        }
                      />
                    </Box>

                  </GlassPaper>
                </Grid>
              </Grid>

              {/* Data Tables */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <GlassPaper>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" gutterBottom>
                        Recent Users
                      </Typography>
                      <Box display="flex" gap={1}>
                        <DatePicker
                          selected={reportConfig.usersStartDate || reportConfig.startDate}
                          onChange={(date) => setReportConfig({ ...reportConfig, usersStartDate: date })}
                          selectsStart
                          startDate={reportConfig.usersStartDate || reportConfig.startDate}
                          endDate={reportConfig.usersEndDate || reportConfig.endDate}
                          customInput={
                            <TextField
                              size="small"
                              sx={{ width: 120 }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <FilterAlt fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          }
                        />
                        <DatePicker
                          selected={reportConfig.usersEndDate || reportConfig.endDate}
                          onChange={(date) => setReportConfig({ ...reportConfig, usersEndDate: date })}
                          selectsEnd
                          startDate={reportConfig.usersStartDate || reportConfig.startDate}
                          endDate={reportConfig.usersEndDate || reportConfig.endDate}
                          minDate={reportConfig.usersStartDate || reportConfig.startDate}
                          customInput={
                            <TextField
                              size="small"
                              sx={{ width: 120 }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <FilterAlt fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          }
                        />
                        <PDFDownloadLink
                          document={
                            <PDFDocument
                              data={{
                                title: 'Recent Users Report',
                                users: users.filter(user => {
                                  const userDate = new Date(user.created_at);
                                  const startDate = reportConfig.usersStartDate || reportConfig.startDate;
                                  const endDate = reportConfig.usersEndDate || reportConfig.endDate;
                                  return userDate >= startDate && userDate <= endDate;
                                }),
                                type: 'users'
                              }}
                              config={{
                                title: 'Recent Users Report',
                                includeTables: true
                              }}
                            />
                          }
                          fileName="recent_users_report.pdf"
                        >
                          {({ loading }) => (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<PictureAsPdf />}
                              disabled={loading}
                            >
                              {loading ? '...' : 'PDF'}
                            </Button>
                          )}
                        </PDFDownloadLink>
                      </Box>
                    </Box>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {users
                            .filter(user => {
                              const userDate = new Date(user.created_at);
                              const startDate = reportConfig.usersStartDate || reportConfig.startDate;
                              const endDate = reportConfig.usersEndDate || reportConfig.endDate;
                              return userDate >= startDate && userDate <= endDate;
                            })
                            .slice(0, 5)
                            .map(user => (
                              <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={user.isApproved ? 'Approved' : 'Pending'}
                                    size="small"
                                    color={user.isApproved ? 'success' : 'warning'}
                                  />
                                </TableCell>
                                <TableCell>
                                  {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </GlassPaper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <GlassPaper>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" gutterBottom>
                        Recent Categories
                      </Typography>
                      <Box display="flex" gap={1}>
                        <DatePicker
                          selected={reportConfig.categoriesStartDate || reportConfig.startDate}
                          onChange={(date) => setReportConfig({ ...reportConfig, categoriesStartDate: date })}
                          selectsStart
                          startDate={reportConfig.categoriesStartDate || reportConfig.startDate}
                          endDate={reportConfig.categoriesEndDate || reportConfig.endDate}
                          customInput={
                            <TextField
                              size="small"
                              sx={{ width: 120 }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <FilterAlt fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          }
                        />
                        <DatePicker
                          selected={reportConfig.categoriesEndDate || reportConfig.endDate}
                          onChange={(date) => setReportConfig({ ...reportConfig, categoriesEndDate: date })}
                          selectsEnd
                          startDate={reportConfig.categoriesStartDate || reportConfig.startDate}
                          endDate={reportConfig.categoriesEndDate || reportConfig.endDate}
                          minDate={reportConfig.categoriesStartDate || reportConfig.startDate}
                          customInput={
                            <TextField
                              size="small"
                              sx={{ width: 120 }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <FilterAlt fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          }
                        />
                        <PDFDownloadLink
                          document={
                            <PDFDocument
                              data={{
                                title: 'Recent Categories Report',
                                categories: categories.filter(category => {
                                  const categoryDate = new Date(category.created_at);
                                  const startDate = reportConfig.categoriesStartDate || reportConfig.startDate;
                                  const endDate = reportConfig.categoriesEndDate || reportConfig.endDate;
                                  return categoryDate >= startDate && categoryDate <= endDate;
                                }),
                                type: 'categories'
                              }}
                              config={{
                                title: 'Recent Categories Report',
                                includeTables: true
                              }}
                            />
                          }
                          fileName="recent_categories_report.pdf"
                        >
                          {({ loading }) => (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<PictureAsPdf />}
                              disabled={loading}
                            >
                              {loading ? '...' : 'PDF'}
                            </Button>
                          )}
                        </PDFDownloadLink>
                      </Box>
                    </Box>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Rate</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {categories
                            .filter(category => {
                              const categoryDate = new Date(category.created_at);
                              const startDate = reportConfig.categoriesStartDate || reportConfig.startDate;
                              const endDate = reportConfig.categoriesEndDate || reportConfig.endDate;
                              return categoryDate >= startDate && categoryDate <= endDate;
                            })
                            .slice(0, 5)
                            .map(category => (
                              <TableRow key={category.id}>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>{category.tax_percentage}%</TableCell>
                                <TableCell>
                                  <Chip
                                    label={category.is_active ? 'Active' : 'Inactive'}
                                    size="small"
                                    color={category.is_active ? 'success' : 'error'}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
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
                <InputLabel>Report Sections</InputLabel>
                <Select
                  multiple
                  value={Object.keys(pdfConfig).filter(key => pdfConfig[key])}
                  onChange={(e) => {
                    const newConfig = { ...pdfConfig };
                    Object.keys(pdfConfig).forEach(key => {
                      newConfig[key] = e.target.value.includes(key);
                    });
                    setPdfConfig(newConfig);
                  }}
                  renderValue={(selected) => selected.join(', ')}
                >
                  <SelectMenuItem value="includeCharts">Include Charts</SelectMenuItem>
                  <SelectMenuItem value="includeTables">Include Data Tables</SelectMenuItem>
                  <SelectMenuItem value="includeUserDetails">Include User Details</SelectMenuItem>
                  <SelectMenuItem value="includeCategoryDetails">Include Category Details</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Report Title"
                  value={pdfConfig.title}
                  onChange={(e) => setPdfConfig({ ...pdfConfig, title: e.target.value })}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
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
                data={generateReportData()}
                config={pdfConfig}
                reportConfig={reportConfig}
              />
            }
            fileName="admin_report.pdf"
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
