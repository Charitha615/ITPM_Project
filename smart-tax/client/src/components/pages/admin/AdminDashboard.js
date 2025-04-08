import React, { useState, useEffect } from 'react';
import { Percent } from '@mui/icons-material';
import {
  AppBar, Toolbar, Typography, Container, Paper, Tabs, Tab, Box,
  TextField, Button, Checkbox, FormControlLabel, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Grid,
  IconButton, Menu, MenuItem, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, useTheme, useMediaQuery, styled,
  LinearProgress, Snackbar, Alert, InputAdornment
} from '@mui/material';
import {
  Add, Check, Close, Edit, Delete, Logout,
  DarkMode, LightMode, Menu as MenuIcon, Search,
  Percentage, Category, Info, ToggleOn, ToggleOff
} from '@mui/icons-material';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

// Futuristic styled components
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
  boxShadow: theme.shadows[10]
}));

const NeonButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  fontWeight: 'bold',
  textTransform: 'none',
  borderRadius: '8px',
  padding: '8px 20px',
  boxShadow: `0 0 8px ${theme.palette.primary.main}`,
  '&:hover': {
    boxShadow: `0 0 15px ${theme.palette.primary.main}`
  }
}));

const HolographicTableHead = styled(TableHead)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(45deg, rgba(30, 30, 40, 0.9) 0%, rgba(50, 50, 70, 0.9) 100%)'
    : 'linear-gradient(45deg, rgba(240, 240, 255, 0.9) 0%, rgba(220, 220, 240, 0.9) 100%)',
  borderBottom: `2px solid ${theme.palette.divider}`
}));

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // State management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState({
    name: '',
    tax_percentage: '',
    description: '',
    is_active: true
  });
  const [editCategory, setEditCategory] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // API functions
  const taxCategoriesApi = {
    getAll: () => api.get('api/tax-categories'),
    getById: (id) => api.get(`api/tax-categories/${id}`),
    create: (data) => api.post('api/tax-categories', data),
    update: (id, data) => api.put(`api/tax-categories/${id}`, data),
    delete: (id) => api.delete(`api/tax-categories/${id}`),
  };

  const authApi = {
    logout: () => {
      localStorage.removeItem('token');
      navigate('/login');
    },
  };

  // Fetch categories with error handling
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await taxCategoriesApi.getAll();
      setCategories(response.data);
      setError(null);
    } catch (err) {
      handleApiError(err, 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  // Handle API errors consistently
  const handleApiError = (err, defaultMessage) => {
    const errorMessage = err.response?.data?.message || defaultMessage;
    setError(errorMessage);
    console.error(errorMessage, err);

    if (err.response?.status === 401) {
      authApi.logout();
    }
  };

  // CRUD Operations
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await taxCategoriesApi.create(newCategory);
      setCategories([...categories, response.data]);
      setNewCategory({ name: '', tax_percentage: '', description: '', is_active: true });
      setSuccess('Category created successfully!');
    } catch (err) {
      handleApiError(err, 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await taxCategoriesApi.update(editCategory.id, editCategory);
      setCategories(categories.map(cat =>
        cat.id === editCategory.id ? response.data : cat
      ));
      setEditCategory(null);
      setSuccess('Category updated successfully!');
    } catch (err) {
      handleApiError(err, 'Failed to update category');
    }
  };

  const handleCategoryChange = (e) => {
    const { name, value, type, checked } = e.target;
    const targetState = editCategory ? setEditCategory : setNewCategory;
    targetState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDeleteCategory = async () => {
    try {
      await taxCategoriesApi.delete(categoryToDelete);
      setCategories(categories.filter(cat => cat.id !== categoryToDelete));
      setDeleteDialogOpen(false);
      setSuccess('Category deleted successfully!');
    } catch (err) {
      handleApiError(err, 'Failed to delete category');
    }
  };

  const toggleCategoryStatus = async (category) => {
    try {
      const updatedCategory = { ...category, is_active: !category.is_active };
      const response = await taxCategoriesApi.update(category.id, updatedCategory);
      setCategories(categories.map(cat =>
        cat.id === category.id ? response.data : cat
      ));
      setSuccess(`Category ${updatedCategory.is_active ? 'activated' : 'deactivated'}!`);
    } catch (err) {
      handleApiError(err, 'Failed to update category status');
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Set up interceptors
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

    fetchCategories();

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
      {/* Futuristic App Bar */}
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
            TAX CATEGORIES MANAGER
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
        <GlassPaper sx={{ p: isMobile ? 1 : 3, mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab label="Categories" icon={<Category />} iconPosition="start" />
            <Tab label="Analytics" icon={<Info />} iconPosition="start" disabled />
          </Tabs>
        </GlassPaper>

        {activeTab === 0 && (
          <Box>
            {/* Search and Create Section */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="secondary" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '8px' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{
                display: 'flex',
                justifyContent: isMobile ? 'flex-start' : 'flex-end',
                gap: 2
              }}>
                <NeonButton
                  startIcon={<Add />}
                  onClick={() => setEditCategory(null)}
                >
                  New Category
                </NeonButton>
              </Grid>
            </Grid>

            {/* Category Form */}
            {(editCategory || !isMobile) && (
              <GlassPaper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main' }}>
                  {editCategory ? 'Edit Category' : 'Create New Category'}
                </Typography>
                <form onSubmit={editCategory ? handleUpdateCategory : handleCreateCategory}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Category Name"
                        name="name"
                        value={editCategory ? editCategory.name : newCategory.name}
                        onChange={(e) => handleCategoryChange(e)}
                        required
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Category color="secondary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Tax Percentage"
                        name="tax_percentage"
                        type="number"
                        value={editCategory ? editCategory.tax_percentage : newCategory.tax_percentage}
                        onChange={(e) => handleCategoryChange(e)}
                        InputProps={{
                          inputProps: { min: 0, max: 100, step: 0.01 },
                          startAdornment: (
                            <InputAdornment position="start">
                              <Percent color="secondary" />
                            </InputAdornment>
                          ),
                        }}
                        required
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={editCategory ? editCategory.is_active : newCategory.is_active}
                            onChange={(e) => handleCategoryChange(e)}
                            name="is_active"
                            color="secondary"
                            icon={<ToggleOff />}
                            checkedIcon={<ToggleOn />}
                          />
                        }
                        label="Active"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        name="description"
                        value={editCategory ? editCategory.description : newCategory.description}
                        onChange={(e) => handleCategoryChange(e)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
                      <NeonButton type="submit">
                        {editCategory ? 'Update' : 'Create'}
                      </NeonButton>
                      {editCategory && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => setEditCategory(null)}
                        >
                          Cancel
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </form>
              </GlassPaper>
            )}

            {/* Categories List */}
            <GlassPaper sx={{ p: isMobile ? 1 : 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'secondary.main' }}>
                  Tax Categories
                </Typography>
                {loading && <LinearProgress sx={{ width: '100px' }} />}
              </Box>

              <TableContainer sx={{
                maxHeight: 'calc(100vh - 400px)',
                '&::-webkit-scrollbar': {
                  width: '6px',
                  height: '6px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme.palette.secondary.main,
                  borderRadius: '3px'
                }
              }}>
                <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                  <HolographicTableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Tax %</TableCell>
                      {!isMobile && <TableCell>Description</TableCell>}
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </HolographicTableHead>
                  <TableBody>
                    {filteredCategories.length === 0 && !loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No categories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCategories.map((category) => (
                        <TableRow
                          key={category.id}
                          hover
                          sx={{
                            '&:last-child td': { borderBottom: 0 },
                            '&:hover': {
                              background: theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.03)'
                                : 'rgba(0, 0, 0, 0.03)'
                            }
                          }}
                        >
                          <TableCell>{category.name}</TableCell>
                          <TableCell align="right">{category.tax_percentage}%</TableCell>
                          {!isMobile && (
                            <TableCell sx={{
                              maxWidth: 300,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {category.description}
                            </TableCell>
                          )}
                          <TableCell>
                            <Chip
                              label={category.is_active ? 'Active' : 'Inactive'}
                              color={category.is_active ? 'success' : 'error'}
                              size="small"
                              variant="outlined"
                              icon={category.is_active ? <Check /> : <Close />}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                            <IconButton
                              color="secondary"
                              onClick={() => setEditCategory(category)}
                              size="small"
                              sx={{ '&:hover': { color: theme.palette.primary.main } }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => {
                                setCategoryToDelete(category.id);
                                setDeleteDialogOpen(true);
                              }}
                              size="small"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                            <IconButton
                              color={category.is_active ? 'warning' : 'success'}
                              onClick={() => toggleCategoryStatus(category)}
                              size="small"
                            >
                              {category.is_active ? <Close fontSize="small" /> : <Check fontSize="small" />}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </GlassPaper>
          </Box>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperComponent={GlassPaper}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this category?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <NeonButton
            onClick={handleDeleteCategory}
            color="error"
            sx={{ background: theme.palette.error.main }}
          >
            Delete
          </NeonButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;