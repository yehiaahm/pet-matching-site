import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Ban, Unlock, AlertTriangle, Edit2, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [bannedFilter, setBannedFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null); // ban, warning, role
  const [modalData, setModalData] = useState({ reason: '', newRole: '' });

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, bannedFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        role: roleFilter,
        isBanned: bannedFilter,
      });

      const response = await fetch(`/api/v1/admin/users?${params}`, {
        headers: {
          ...authHeaders(),
        },
      });
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    try {
      const response = await fetch('/api/v1/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          userId: selectedUser.id,
          reason: modalData.reason,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('User banned successfully');
        setModalType(null);
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to ban user');
      }
    } catch (error) {
      toast.error('Error banning user');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      const response = await fetch('/api/v1/admin/users/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('User unbanned successfully');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to unban user');
      }
    } catch (error) {
      toast.error('Error unbanning user');
    }
  };

  const handleAddWarning = async () => {
    try {
      const response = await fetch('/api/v1/admin/users/warning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          userId: selectedUser.id,
          reason: modalData.reason,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setModalType(null);
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to add warning');
      }
    } catch (error) {
      toast.error('Error adding warning');
    }
  };

  const handleChangeRole = async () => {
    if (!modalData.newRole) {
      toast.error('Please select a new role');
      return;
    }
    try {
      const response = await fetch('/api/v1/admin/users/change-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          userId: selectedUser.id,
          newRole: modalData.newRole,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Role changed successfully');
        setModalType(null);
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to change role');
      }
    } catch (error) {
      toast.error('Error changing role');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users by email or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={(val) => {
            setRoleFilter(val);
            setPage(1);
          }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="BREEDER">Breeder</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="MODERATOR">Moderator</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bannedFilter} onValueChange={(val) => {
            setBannedFilter(val);
            setPage(1);
          }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Users</SelectItem>
              <SelectItem value="false">Active</SelectItem>
              <SelectItem value="true">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Badge className="bg-red-500">Banned</Badge>
                      ) : (
                        <Badge className="bg-green-500">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.rating.toFixed(1)} ⭐</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.isBanned ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnbanUser(user.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Unlock className="w-4 h-4" />
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setModalType('warning');
                              }}
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setModalType('ban');
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setModalType('role');
                                setModalData({ reason: '', newRole: user.role });
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modals */}
        <Dialog open={modalType === 'ban'} onOpenChange={() => setModalType(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  User: {selectedUser?.email}
                </p>
                <Textarea
                  placeholder="Reason for ban..."
                  value={modalData.reason}
                  onChange={(e) =>
                    setModalData({ ...modalData, reason: e.target.value })
                  }
                />
              </div>
              <Button
                onClick={handleBanUser}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Ban User
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={modalType === 'warning'} onOpenChange={() => setModalType(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Warning</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  User: {selectedUser?.email}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Warnings: {selectedUser?.warnings}/3
                </p>
                <Textarea
                  placeholder="Warning reason..."
                  value={modalData.reason}
                  onChange={(e) =>
                    setModalData({ ...modalData, reason: e.target.value })
                  }
                />
              </div>
              <Button
                onClick={handleAddWarning}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                Add Warning
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={modalType === 'role'} onOpenChange={() => setModalType(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  User: {selectedUser?.email}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Current Role: {selectedUser?.role}
                </p>
                <Select
                  value={modalData.newRole}
                  onValueChange={(val) =>
                    setModalData({ ...modalData, newRole: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="BREEDER">Breeder</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MODERATOR">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleChangeRole}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Change Role
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default UserManagement;
