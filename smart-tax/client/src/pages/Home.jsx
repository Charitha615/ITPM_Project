import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Box sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant="h3" gutterBottom>
        Welcome to Smart TAX
      </Typography>
      <Typography variant="h5" gutterBottom>
        Your intelligent tax management solution
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button 
          variant="contained" 
          size="large" 
          component={Link} 
          to="/register"
          sx={{ mr: 2 }}
        >
          Get Started
        </Button>
        <Button 
          variant="outlined" 
          size="large" 
          component={Link} 
          to="/login"
        >
          Login
        </Button>
      </Box>
    </Box>
  );
}

export default Home;