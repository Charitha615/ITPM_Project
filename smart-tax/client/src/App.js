import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TaxProfile from './pages/TaxProfile';
import ExpenseDashboard from './pages/ExpenseDashboard';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/admin/Dashboard';

// Add this PrivateRoute component inside App.js or in a separate file
const PrivateRoute = ({ children, roles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthorized = user && roles.includes(user.role);

  return isAuthorized ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <CssBaseline />
      <Navbar />
      <Container maxWidth="lg">
        <Routes>
          <Route path="/" element={<Home />} />
          // Add this route to your existing Routes
          <Route
            path="/expenses"
            element={
              <PrivateRoute roles={['taxpayer', 'admin']}>
                <ExpenseDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/dashboard" element={
            <PrivateRoute roles={['taxpayer', 'admin']}>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={
            <PrivateRoute roles={['taxpayer', 'admin']}>
              <TaxProfile />
            </PrivateRoute>
          } />
          <Route path="/admin/*" element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;