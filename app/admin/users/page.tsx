'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Ban, Unlock, DollarSign, Eye } from 'lucide-react';

interface User {
  id: string;
  telegram_id: number;
  username?: string;
  first_name?: string;
  balance: number;
  role: 'user' | 'admin';
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceAdjustment, setBalanceAdjustment] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceAdjustment = async (userId: string) => {
    const adjustment = parseFloat(balanceAdjustment);
    if (isNaN(adjustment)) {
      return;
    }

    const { data: user } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (user) {
      const newBalance = user.balance + adjustment;
      const { error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (error) {
        console.error('Error adjusting balance:', error);
        return;
      }

      setBalanceAdjustment('');
      setSelectedUser(null);
      loadUsers();
    }
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(search) ||
      user.first_name?.toLowerCase().includes(search) ||
      user.telegram_id.toString().includes(search)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users Management</h1>
      </div>

      <Card>
        <Input
          label="Search Users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username, name, or Telegram ID"
        />
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Telegram ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">
                      {user.first_name || user.username || 'Unknown'}
                    </div>
                    <div className="text-sm text-dark-muted">@{user.username || 'no_username'}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{user.telegram_id}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'warning' : 'default'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(user.balance)}
                  </TableCell>
                  <TableCell className="text-sm text-dark-muted">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedUser(user)}
                      >
                        <DollarSign className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {selectedUser && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Adjust Balance for @{selectedUser.username}</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-dark-muted mb-2">Current Balance: {formatCurrency(selectedUser.balance)}</p>
            </div>
            <Input
              label="Adjustment Amount"
              type="number"
              value={balanceAdjustment}
              onChange={(e) => setBalanceAdjustment(e.target.value)}
              placeholder="e.g., 100 or -50"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleBalanceAdjustment(selectedUser.id)}
                variant="primary"
              >
                Apply Adjustment
              </Button>
              <Button
                onClick={() => {
                  setSelectedUser(null);
                  setBalanceAdjustment('');
                }}
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}


