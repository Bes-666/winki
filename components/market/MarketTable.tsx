'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Search, Filter, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChange, setFilterChange] = useState<'all' | 'gainers' | 'losers'>('all');

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

  // Фильтрация и сортировка данных
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          row.skill_name.toLowerCase().includes(query) ||
          row.owner.toLowerCase().includes(query)
      );
    }

    // Фильтр по изменению
    if (filterChange === 'gainers') {
      filtered = filtered.filter((row) => row.change24h > 0);
    } else if (filterChange === 'losers') {
      filtered = filtered.filter((row) => row.change24h < 0);
    }

    // Сортировка
    return filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }, [data, searchQuery, filterChange, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Поиск и фильтры */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-muted" />
            <Input
              type="text"
              placeholder="Search skills or owners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterChange('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filterChange === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-card text-dark-muted hover:text-dark-text'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilterChange('gainers')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
              filterChange === 'gainers'
                ? 'bg-success text-white'
                : 'bg-dark-card text-dark-muted hover:text-dark-text'
            )}
          >
            <TrendingUp className="w-4 h-4" />
            Gainers
          </button>
          <button
            onClick={() => setFilterChange('losers')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
              filterChange === 'losers'
                ? 'bg-danger text-white'
                : 'bg-dark-card text-dark-muted hover:text-dark-text'
            )}
          >
            <TrendingDown className="w-4 h-4" />
            Losers
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="flex items-center justify-between text-sm text-dark-muted">
        <span>
          Showing {filteredAndSortedData.length} of {data.length} skills
        </span>
        {searchQuery && (
          <Badge variant="info" size="sm">
            Search: "{searchQuery}"
          </Badge>
        )}
      </div>

      <Table>
        <TableHeader>
        <TableRow>
          <TableHead 
            className="cursor-pointer hover:text-dark-text"
            onClick={() => handleSort('skill_name')}
          >
            <div className="flex items-center gap-1">
              Skill
              {sortBy === 'skill_name' && (
                <ArrowUpDown className={cn('w-3 h-3', sortOrder === 'asc' ? 'rotate-180' : '')} />
              )}
            </div>
          </TableHead>
          <TableHead 
            className="text-right cursor-pointer hover:text-dark-text"
            onClick={() => handleSort('price')}
          >
            <div className="flex items-center justify-end gap-1">
              Price
              {sortBy === 'price' && (
                <ArrowUpDown className={cn('w-3 h-3', sortOrder === 'asc' ? 'rotate-180' : '')} />
              )}
            </div>
          </TableHead>
          <TableHead 
            className="text-right cursor-pointer hover:text-dark-text"
            onClick={() => handleSort('change24h')}
          >
            <div className="flex items-center justify-end gap-1">
              24h Change
              {sortBy === 'change24h' && (
                <ArrowUpDown className={cn('w-3 h-3', sortOrder === 'asc' ? 'rotate-180' : '')} />
              )}
            </div>
          </TableHead>
          <TableHead 
            className="text-right cursor-pointer hover:text-dark-text"
            onClick={() => handleSort('volume')}
          >
            <div className="flex items-center justify-end gap-1">
              Volume
              {sortBy === 'volume' && (
                <ArrowUpDown className={cn('w-3 h-3', sortOrder === 'asc' ? 'rotate-180' : '')} />
              )}
            </div>
          </TableHead>
          <TableHead 
            className="text-right cursor-pointer hover:text-dark-text"
            onClick={() => handleSort('market_cap')}
          >
            <div className="flex items-center justify-end gap-1">
              Market Cap
              {sortBy === 'market_cap' && (
                <ArrowUpDown className={cn('w-3 h-3', sortOrder === 'asc' ? 'rotate-180' : '')} />
              )}
            </div>
          </TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAndSortedData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-dark-muted">
              No skills found
            </TableCell>
          </TableRow>
        ) : (
          filteredAndSortedData.map((row, index) => (
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
          ))
        )}
      </TableBody>
    </Table>
    </div>
  );
}


