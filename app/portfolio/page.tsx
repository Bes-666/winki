'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import HoldingsTable from '@/components/portfolio/HoldingsTable';
import TransactionHistory from '@/components/portfolio/TransactionHistory';
import PriceChart from '@/components/market/PriceChart';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { getPortfolioStats } from '@/lib/game-logic';
import { useUser } from '@/contexts/UserContext';

export default function PortfolioPage() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalValue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalProfitPercent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPortfolioStats();
    }
  }, [user]);

  const loadPortfolioStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const investorId = user.id;
      const portfolioStats = await getPortfolioStats(investorId);
      setStats(portfolioStats);
    } catch (error) {
      console.error('Error loading portfolio stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio</h1>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className="text-dark-muted">Total Value</span>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <h2 className="text-3xl font-bold">{formatCurrency(stats.totalValue)}</h2>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className="text-dark-muted">Total Cost</span>
              <span className="text-sm text-dark-muted">Invested</span>
            </div>
            <h2 className="text-3xl font-bold">{formatCurrency(stats.totalCost)}</h2>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className="text-dark-muted">Total P/L</span>
              <div className={cn(
                'flex items-center gap-1',
                stats.totalProfit >= 0 ? 'text-success' : 'text-danger'
              )}>
                {stats.totalProfit >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span>{formatPercentage(stats.totalProfitPercent)}</span>
              </div>
            </div>
            <h2 className={cn(
              'text-3xl font-bold',
              stats.totalProfit >= 0 ? 'text-success' : 'text-danger'
            )}>
              {formatCurrency(stats.totalProfit)}
            </h2>
          </Card>
        </motion.div>
      </div>

      {/* Holdings Table */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Holdings</h2>
        <HoldingsTable />
      </Card>

      {/* Performance Chart */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Performance</h2>
        <PriceChart />
      </Card>

      {/* Transaction History */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <TransactionHistory />
      </Card>
    </div>
  );
}


