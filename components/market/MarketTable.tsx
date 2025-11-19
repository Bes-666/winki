'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';

interface MarketRow {
  id: string;
  skill_name: string;
  owner: string;
  price: number;
  change24h: number;
  volume: number;
  market_cap: number;
}

export default function MarketTable() {
  const [data, setData] = useState<MarketRow[]>([]);
  const [sortBy, setSortBy] = useState<keyof MarketRow>('market_cap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
    
    const channel = supabase
      .channel('market-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'stocks' },
        () => loadMarketData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const { data: stocks, error } = await supabase
        .from('stocks')
        .select(`
          *,
          skills!inner (
            id,
            name,
            status,
            users!skills_user_id_fkey (
              username
            )
          )
        `)
        .eq('skills.status', 'approved')
        .order('current_price', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading market data:', error);
        return;
      }

      if (stocks) {
        const formatted = stocks.map((stock: any) => {
          const change24h = stock.previous_price 
            ? ((stock.current_price - stock.previous_price) / stock.previous_price) * 100
            : 0;

          return {
            id: stock.id,
            skill_name: stock.skills?.name || 'Unknown',
            owner: stock.skills?.users?.username || 'Unknown',
            price: stock.current_price,
            change24h,
            volume: stock.volume_24h || 0,
            market_cap: stock.current_price * stock.total_shares,
          };
        });
        setData(formatted);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: keyof MarketRow) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead 
            className="cursor-pointer hover:text-dark-text"
            onClick={() => handleSort('skill_name')}
          >
            Skill
          </TableHead>
          <TableHead 
            className="text-right cursor-pointer hover:text-dark-text"
            onClick={() => handleSort('price')}
          >
            Price
          </TableHead>
          <TableHead 
            className="text-right cursor-pointer hover:text-dark-text"
            onClick={() => handleSort('change24h')}
          >
            24h Change
          </TableHead>
          <TableHead 
            className="text-right cursor-pointer hover:text-dark-text"
            onClick={() => handleSort('volume')}
          >
            Volume
          </TableHead>
          <TableHead 
            className="text-right cursor-pointer hover:text-dark-text"
            onClick={() => handleSort('market_cap')}
          >
            Market Cap
          </TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((row, index) => (
          <motion.tr
            key={row.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="border-b border-dark-border/50 hover:bg-dark-card/50 transition-colors"
          >
            <TableCell>
              <div>
                <div className="font-medium">{row.skill_name}</div>
                <div className="text-sm text-dark-muted">@{row.owner}</div>
              </div>
            </TableCell>
            <TableCell className="text-right font-mono font-semibold">
              {formatCurrency(row.price)}
            </TableCell>
            <TableCell className="text-right">
              <div className={cn(
                'flex items-center justify-end gap-1 font-medium',
                row.change24h >= 0 ? 'text-success' : 'text-danger'
              )}>
                {row.change24h >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{formatPercentage(row.change24h)}</span>
              </div>
            </TableCell>
            <TableCell className="text-right font-mono text-sm text-dark-muted">
              {formatCurrency(row.volume)}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {formatCurrency(row.market_cap)}
            </TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="primary">
                Trade
              </Button>
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  );
}


