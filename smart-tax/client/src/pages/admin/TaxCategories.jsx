import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  Typography
} from '@mui/material';
import api from '../../api';

function TaxCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    id: null,
    name: '',
    description: '',
    tax_percentage: 0,
    max_deduction: null,
    is_active: true
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/admin/categories');
        setCategories(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setCurrentCategory(prev => ({
      ...prev,
      [name]: name === 'is_active' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await api.put(`/admin/categories/${currentCategory.id}`, currentCategory);
        setCategories(categories.map(cat => 
          cat.id === currentCategory.id ? currentCategory : cat
        ));
      } else {
        const response = await api.post('/admin/categories', currentCategory);
        setCategories([...categories, response.data]);
      }
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const resetForm = () => {
    setCurrentCategory({
      id: null,
      name: '',
      description: '',
      tax_percentage: 0,
      max_deduction: null,
      is_active: true
    });
    setEditMode(false);
  };

  if (loading) {
    return <Typography>Loading categories...</Typography>;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => setOpenDialog(true)}
        >
          Add New Category
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Tax %</TableCell>
              <TableCell>Max Deduction</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map(category => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.tax_percentage}%</TableCell>
                <TableCell>
                  {category.max_deduction ? `$${category.max_deduction}` : 'None'}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={category.is_active}
                    onChange={() => handleEdit({ ...category, is_active: !category.is_active })}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(category)}>Edit</Button>
                  <Button 
                    color="error"
                    onClick={() => handleDelete(category.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false);
        resetForm();
      }}>
        <DialogTitle>
          {editMode ? 'Edit Tax Category' : 'Add New Tax Category'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Category Name"
            name="name"
            fullWidth
            value={currentCategory.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={currentCategory.description}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Tax Percentage"
            name="tax_percentage"
            type="number"
            fullWidth
            value={currentCategory.tax_percentage}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Max Deduction (optional)"
            name="max_deduction"
            type="number"
            fullWidth
            value={currentCategory.max_deduction || ''}
            onChange={handleInputChange}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Switch
              name="is_active"
              checked={currentCategory.is_active}
              onChange={handleInputChange}
              color="primary"
            />
            <Typography>Active</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default TaxCategories;