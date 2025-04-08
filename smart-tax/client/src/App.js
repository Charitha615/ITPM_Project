import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import AdminDashboard from './components/pages/admin/AdminDashboard'



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        

      </Routes>
    </Router>
  );
}

export default App;