import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Smart TAX
        </Typography>
        <Button color="inherit" component={Link} to="/">Home</Button>
        {user && (
          <>
            <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
      
            <Button
              color="inherit"
              component={Link}
              to="/expenses"
              sx={{ mr: 2 }}
            >
              Expenses
            </Button>
            {user.role === 'admin' && (
              <Button color="inherit" component={Link} to="/admin">Admin</Button>
            )}
          </>
        )}
        {!user ? (
          <>
            <Button color="inherit" component={Link} to="/login">Login</Button>
            <Button color="inherit" component={Link} to="/register">Register</Button>
          </>
        ) : (
          <Button
            color="inherit"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
          >
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;