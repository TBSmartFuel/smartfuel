import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  TablePagination,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { User } from '../../types';
import { adminApi } from '../../services/api';

const UserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search query only
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
    setPage(0);
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllUsers();
      console.log('Raw response from backend:', response);
      response.forEach(user => {
        console.log('User data:', {
          id: user.id,
          email: user.email,
          is_active: user.is_active,
          is_admin: user.is_admin,
          is_approved: user.is_approved,
          type: typeof user.is_approved
        });
      });
      setUsers(response);
      setFilteredUsers(response);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch users';
      setError(errorMsg);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: number, currentStatus: boolean) => {
    try {
      setLoading(true);
      setError(null);
      await adminApi.toggleUserAdmin(userId);
      await fetchUsers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to update user status';
      setError(errorMsg);
      console.error('Error updating user status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    try {
      setLoading(true);
      setError(null);
      await adminApi.toggleUserActive(userId);
      await fetchUsers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to update user activation status';
      setError(errorMsg);
      console.error('Error updating user activation status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApprovalStatus = (user: User) => {
    console.log('Processing user status:', {
      email: user.email,
      is_active: user.is_active,
      is_admin: user.is_admin,
      is_approved: user.is_approved,
      type: typeof user.is_approved
    });

    if (!user.is_active) {
      return { label: 'Inactive', color: 'error' as const, icon: <InactiveIcon /> };
    }
    if (user.is_admin) {
      return { label: 'Admin', color: 'primary' as const, icon: <AdminIcon /> };
    }
    if (!user.is_approved) {
      return { label: 'Active User', color: 'success' as const, icon: <ActiveIcon /> };
    }
    return { label: 'Pending', color: 'warning' as const, icon: <PendingIcon /> };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !users.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        User Manager
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="center">Actions</TableCell>
              <TableCell align="center">Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getApprovalStatus(user).icon}
                      label={getApprovalStatus(user).label}
                      color={getApprovalStatus(user).color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={user.is_admin ? <AdminIcon /> : <UserIcon />}
                      label={user.is_admin ? 'Admin' : 'User'}
                      color={user.is_admin ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={formatDate(user.created_at)}>
                      <span>{formatDate(user.created_at)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={`${user.is_admin ? 'Remove' : 'Grant'} admin rights`}>
                      <IconButton
                        onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                        disabled={loading}
                        color={user.is_admin ? 'error' : 'primary'}
                        size="small"
                      >
                        {user.is_admin ? <UserIcon /> : <AdminIcon />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={`${user.is_active ? 'Deactivate' : 'Activate'} user`}>
                      <Switch
                        checked={user.is_active}
                        onChange={() => handleToggleActive(user.id, user.is_active)}
                        disabled={loading}
                        color="primary"
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>
    </Box>
  );
};

export default UserManager; 