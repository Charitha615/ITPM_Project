import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
import UsersManagement from './UsersManagement';
import TaxCategories from './TaxCategories';
import Reports from './Reports';
import api from '../../api';

function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        await api.get('/admin/users');
        setLoading(false);
      } catch (error) {
        window.location.href = '/';
      }
    };
    verifyAdmin();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Users Management" />
          <Tab label="Tax Categories" />
          <Tab label="Reports" />
        </Tabs>
      </Box>
      
      <Box sx={{ pt: 3 }}>
        {tabValue === 0 && <UsersManagement />}
        {tabValue === 1 && <TaxCategories />}
        {tabValue === 2 && <Reports />}
      </Box>
    </Box>
  );
}

export default AdminDashboard;