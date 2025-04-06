import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import api from '../../api';

function Reports() {
  const [userStats, setUserStats] = useState([]);
  const [filingStats, setFilingStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, filingsRes] = await Promise.all([
          api.get('/admin/reports/users'),
          api.get('/admin/reports/tax-filings')
        ]);
        setUserStats(usersRes.data);
        setFilingStats(filingsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Typography>Loading reports...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>User Statistics</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>Total Users</TableCell>
                <TableCell>Approved</TableCell>
                <TableCell>Pending</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userStats.map(stat => (
                <TableRow key={stat.role}>
                  <TableCell>{stat.role}</TableCell>
                  <TableCell>{stat.total}</TableCell>
                  <TableCell>{stat.approved}</TableCell>
                  <TableCell>{stat.pending}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Tax Filing Statistics</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Year</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Count</TableCell>
                <TableCell>Total Tax Owed</TableCell>
                <TableCell>Total Tax Paid</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filingStats.map(stat => (
                <TableRow key={`${stat.year}-${stat.status}`}>
                  <TableCell>{stat.year}</TableCell>
                  <TableCell>{stat.status}</TableCell>
                  <TableCell>{stat.count}</TableCell>
                  <TableCell>${stat.total_tax_owed.toFixed(2)}</TableCell>
                  <TableCell>${stat.total_tax_paid.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default Reports;