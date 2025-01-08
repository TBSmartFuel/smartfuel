import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import api from '../../services/api';

interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

const UserApproval = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get('/admin/users/pending');
      setPendingUsers(response.data);
    } catch (err) {
      setError('Failed to fetch pending users');
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/approve`);
      setSuccessMessage('User approved successfully');
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to approve user');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/reject`);
      setSuccessMessage('User rejected successfully');
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to reject user');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pending User Approvals
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Signup Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleApprove(user.id)}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleReject(user.id)}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pendingUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No pending approvals
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserApproval; 