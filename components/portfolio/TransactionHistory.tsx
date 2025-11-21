'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';

interface Transaction {
  id: string;
  skill_name: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
  created_at: string;
}

export default function TransactionHistory() {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const investorId = user.id;

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          skills (
            name
          )
        `)
        .eq('investor_id', investorId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading transactions:', error);
        return;
      }

      if (data) {
        const formatted = data.map((tx: any) => ({
          id: tx.id,
          skill_name: tx.skills?.name || 'Unknown',
          type: tx.type,
          shares: tx.shares,
          price: tx.price,
          total: tx.total,
          created_at: tx.created_at,
        }));
        setTransactions(formatted);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-dark-muted">
        No transactions yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Skill</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Shares</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="font-medium">{tx.skill_name}</TableCell>
            <TableCell>
              <Badge variant={tx.type === 'buy' ? 'success' : 'danger'}>
                {tx.type.toUpperCase()}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatNumber(tx.shares)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(tx.price)}
            </TableCell>
            <TableCell className="text-right font-mono font-semibold">
              {formatCurrency(tx.total)}
            </TableCell>
            <TableCell className="text-right text-sm text-dark-muted">
              {new Date(tx.created_at).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


