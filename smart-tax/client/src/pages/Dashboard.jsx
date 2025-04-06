import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Paper, Grid, 
  Card, CardContent, Button, CircularProgress
} from '@mui/material';
import { 
  AccountCircle, Receipt, Category, Paid 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, expensesRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/expenses/summary')
        ]);
        setUserData(userRes.data);
        setExpenseSummary(expensesRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {userData?.username}
        </Typography>
        
        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Paid color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5">Tax Summary</Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                  Total Expenses: ${expenseSummary?.total_expenses?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="body2">
                  Potential Deductions: ${expenseSummary?.total_deductions?.toFixed(2) || '0.00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Category color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5">Categories</Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                  {expenseSummary?.category_count || 0} Active
                </Typography>
                <Typography variant="body2">
                  Most Used: {expenseSummary?.top_category || 'None'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Receipt color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5">Recent Expenses</Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                  {expenseSummary?.expense_count || 0} Total
                </Typography>
                <Typography variant="body2">
                  Last Added: {expenseSummary?.last_expense_date || 'Never'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Quick Actions */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Quick Actions</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                component={Link}
                to="/expenses"
                startIcon={<Receipt />}
              >
                Add Expense
              </Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/profile"
                startIcon={<AccountCircle />}
              >
                Update Profile
              </Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/expenses"
                startIcon={<Category />}
              >
                View Expenses
              </Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/tax-filing"
                startIcon={<Paid />}
              >
                File Taxes
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Recent Expenses */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Recent Expenses</Typography>
          {expenseSummary?.recent_expenses?.length > 0 ? (
            <Grid container spacing={2}>
              {expenseSummary.recent_expenses.map(expense => (
                <Grid item xs={12} md={6} key={expense.id}>
                  <Paper sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography fontWeight="bold">
                        {expense.category_name}
                      </Typography>
                      <Typography color="primary">
                        ${expense.amount.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(expense.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {expense.description || 'No description'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No expenses recorded yet</Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default Dashboard;