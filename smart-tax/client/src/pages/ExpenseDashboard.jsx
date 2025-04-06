import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Button, TextField, 
  MenuItem, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Edit, Delete, AttachFile } from '@mui/icons-material';
import api from '../api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ExpenseDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentExpense, setCurrentExpense] = useState({
    id: null,
    category_id: '',
    amount: '',
    description: '',
    date: new Date(),
    receipt: null
  });
  const [filters, setFilters] = useState({
    category_id: '',
    start_date: null,
    end_date: null,
    min_amount: '',
    max_amount: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, expensesRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/expenses')
        ]);
        setCategories(categoriesRes.data);
        setExpenses(expensesRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/api/expenses?${params.toString()}`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error filtering expenses:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('category_id', currentExpense.category_id);
      formData.append('amount', currentExpense.amount);
      formData.append('description', currentExpense.description);
      formData.append('date', currentExpense.date.toISOString().split('T')[0]);
      if (currentExpense.receipt) {
        formData.append('receipt', currentExpense.receipt);
      }

      if (currentExpense.id) {
        await api.put(`/api/expenses/${currentExpense.id}`, formData);
      } else {
        await api.post('/api/expenses', formData);
      }

      setOpenDialog(false);
      const response = await api.get('/api/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/expenses/${id}`);
      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Expense Management
        </Typography>
        
        {/* Filter Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Category"
              name="category_id"
              value={filters.category_id}
              onChange={handleFilterChange}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            
            <DatePicker
              selected={filters.start_date}
              onChange={(date) => setFilters({...filters, start_date: date})}
              selectsStart
              startDate={filters.start_date}
              endDate={filters.end_date}
              placeholderText="Start Date"
              className="date-picker"
            />
            
            <DatePicker
              selected={filters.end_date}
              onChange={(date) => setFilters({...filters, end_date: date})}
              selectsEnd
              startDate={filters.start_date}
              endDate={filters.end_date}
              minDate={filters.start_date}
              placeholderText="End Date"
              className="date-picker"
            />
            
            <TextField
              label="Min Amount"
              name="min_amount"
              type="number"
              value={filters.min_amount}
              onChange={handleFilterChange}
            />
            
            <TextField
              label="Max Amount"
              name="max_amount"
              type="number"
              value={filters.max_amount}
              onChange={handleFilterChange}
            />
            
            <Button 
              variant="contained" 
              onClick={applyFilters}
              sx={{ alignSelf: 'center' }}
            >
              Apply Filters
            </Button>
          </Box>
        </Paper>
        
        {/* Add Expense Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setCurrentExpense({
                id: null,
                category_id: '',
                amount: '',
                description: '',
                date: new Date(),
                receipt: null
              });
              setOpenDialog(true);
            }}
          >
            Add Expense
          </Button>
        </Box>
        
        {/* Expenses Table */}
        {loading ? (
          <Typography>Loading expenses...</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Receipt</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map(expense => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.category_name}</TableCell>
                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      {expense.receipt_url && (
                        <IconButton 
                          href={expense.receipt_url} 
                          target="_blank"
                        >
                          <AttachFile />
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setCurrentExpense({
                            id: expense.id,
                            category_id: expense.category_id,
                            amount: expense.amount,
                            description: expense.description,
                            date: new Date(expense.date),
                            receipt: null
                          });
                          setOpenDialog(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(expense.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      
      {/* Add/Edit Expense Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {currentExpense.id ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              select
              label="Category"
              value={currentExpense.category_id}
              onChange={(e) => setCurrentExpense({
                ...currentExpense,
                category_id: e.target.value
              })}
              fullWidth
              required
            >
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name} ({category.tax_percentage}%)
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              label="Amount"
              type="number"
              value={currentExpense.amount}
              onChange={(e) => setCurrentExpense({
                ...currentExpense,
                amount: e.target.value
              })}
              fullWidth
              required
            />
            
            <DatePicker
              selected={currentExpense.date}
              onChange={(date) => setCurrentExpense({
                ...currentExpense,
                date: date
              })}
              dateFormat="yyyy-MM-dd"
              customInput={<TextField fullWidth label="Date" />}
            />
            
            <TextField
              label="Description"
              multiline
              rows={3}
              value={currentExpense.description}
              onChange={(e) => setCurrentExpense({
                ...currentExpense,
                description: e.target.value
              })}
              fullWidth
            />
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFile />}
            >
              Upload Receipt
              <input
                type="file"
                hidden
                onChange={(e) => setCurrentExpense({
                  ...currentExpense,
                  receipt: e.target.files[0]
                })}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentExpense.id ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ExpenseDashboard;