'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

interface Holding {
  id: string;
  skill_name: string;
  owner: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  profit: number;
  profitPercent: number;
}

export default function HoldingsTable() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHoldings();
    
    const channel = supabase
      .channel('portfolio-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'portfolios' },
        () => loadHoldings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadHoldings = async () => {
    try {
      setLoading(true);
      // TODO: Получать investor_id из контекста/сессии
      const investorId = 'user-id-placeholder';

      const { data: portfolios, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          stocks (
            current_price
          ),
          skills (
            name,
            users!skills_user_id_fkey (
              username
            )
          )
        `)
        .eq('investor_id', investorId);

      if (error) {
        console.error('Error loading holdings:', error);
        return;
      }

      if (portfolios) {
        const formatted = portfolios.map((portfolio: any) => {
          const currentPrice = portfolio.stocks?.current_price || 0;
          const value = currentPrice * portfolio.shares;
          const profit = value - (portfolio.average_price * portfolio.shares);
          const profitPercent = portfolio.average_price > 0
            ? ((currentPrice - portfolio.average_price) / portfolio.average_price) * 100
            : 0;

          return {
            id: portfolio.id,
            skill_name: portfolio.skills?.name || 'Unknown',
            owner: portfolio.skills?.users?.username || 'Unknown',
            shares: portfolio.shares,
            averagePrice: portfolio.average_price,
            currentPrice,
            value,
            profit,
            profitPercent,
          };
        });
        setHoldings(formatted);
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

  if (holdings.length === 0) {
    return (
      <div className="text-center py-12 text-dark-muted">
        No holdings yet. Start investing in skills!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Skill</TableHead>
          <TableHead className="text-right">Shares</TableHead>
          <TableHead className="text-right">Avg Price</TableHead>
          <TableHead className="text-right">Current Price</TableHead>
          <TableHead className="text-right">Value</TableHead>
          <TableHead className="text-right">P/L</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holdings.map((holding, index) => (
          <motion.tr
            key={holding.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <TableCell>
              <div>
                <div className="font-medium">{holding.skill_name}</div>
                <div className="text-sm text-dark-muted">@{holding.owner}</div>
              </div>
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatNumber(holding.shares)}
            </TableCell>
            <TableCell className="text-right font-mono text-dark-muted">
              {formatCurrency(holding.averagePrice)}
            </TableCell>
            <TableCell className="text-right font-mono font-semibold">
              {formatCurrency(holding.currentPrice)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(holding.value)}
            </TableCell>
            <TableCell className="text-right">
              <div className={cn(
                'flex items-center justify-end gap-1 font-medium',
                holding.profit >= 0 ? 'text-success' : 'text-danger'
              )}>
                {holding.profit >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{formatCurrency(holding.profit)}</span>
                <span className="text-sm">({formatPercentage(holding.profitPercent)})</span>
              </div>
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  );
}


