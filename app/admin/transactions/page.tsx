'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Download, Filter } from 'lucide-react';

interface Transaction {
  id: string;
  investor: {
    username?: string;
    first_name?: string;
  };
  skill: {
    name: string;
  };
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
  created_at: string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'buy' | 'sell'>('all');

  useEffect(() => {
    loadTransactions();
  }, [typeFilter, dateFrom, dateTo]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('transactions')
        .select(`
          *,
          users!transactions_investor_id_fkey (
            username,
            first_name
          ),
          skills (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading transactions:', error);
        return;
      }

      if (data) {
        setTransactions(data.map((tx: any) => ({
          id: tx.id,
          investor: tx.users || {},
          skill: tx.skills || { name: 'Unknown' },
          type: tx.type,
          shares: tx.shares,
          price: tx.price,
          total: tx.total,
          created_at: tx.created_at,
        })));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Investor', 'Skill', 'Type', 'Shares', 'Price', 'Total'];
    const rows = transactions.map(tx => [
      new Date(tx.created_at).toLocaleString(),
      tx.investor.username || tx.investor.first_name || 'Unknown',
      tx.skill.name,
      tx.type.toUpperCase(),
      tx.shares.toString(),
      tx.price.toFixed(2),
      tx.total.toFixed(2),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Button onClick={exportToCSV} variant="primary">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'buy' | 'sell')}
              className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <Input
            label="Date From"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="Date To"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <div className="flex items-end">
            <Button onClick={loadTransactions} variant="primary" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
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
                <TableHead>Date</TableHead>
                <TableHead>Investor</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm text-dark-muted">
                    {new Date(tx.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div>@{tx.investor.username || tx.investor.first_name || 'Unknown'}</div>
                  </TableCell>
                  <TableCell className="font-medium">{tx.skill.name}</TableCell>
                  <TableCell>
                    <Badge variant={tx.type === 'buy' ? 'success' : 'danger'}>
                      {tx.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{formatNumber(tx.shares)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(tx.price)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(tx.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}


