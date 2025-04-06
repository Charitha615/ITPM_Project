import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import api from '../../api';

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleApproveToggle = async (userId, isApproved) => {
    try {
      await api.put(`/admin/users/${userId}/approve`, {
        is_approved: !isApproved,
        admin_notes: notes
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_approved: !isApproved } : user
      ));
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const openNotesDialog = (user) => {
    setSelectedUser(user);
    setNotes(user.admin_notes || '');
    setOpenDialog(true);
  };

  if (loading) {
    return <Typography>Loading users...</Typography>;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.is_approved ? 'Approved' : 'Pending'}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={user.is_approved}
                    onChange={() => openNotesDialog(user)}
                    color="primary"
                  />
                  <Button onClick={() => openNotesDialog(user)}>
                    Add Notes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedUser && `User: ${selectedUser.username}`}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Admin Notes"
            type="text"
            fullWidth
            variant="standard"
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => handleApproveToggle(selectedUser.id, selectedUser.is_approved)}
            color="primary"
          >
            {selectedUser?.is_approved ? 'Disapprove' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default UsersManagement;