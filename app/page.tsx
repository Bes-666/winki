'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, Target } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import Card from '@/components/ui/Card';
import PriceChart from '@/components/market/PriceChart';
import MarketTable from '@/components/market/MarketTable';
import PortfolioOverview from '@/components/portfolio/PortfolioOverview';

interface Stats {
  totalValue: number;
  dailyChange: number;
  totalUsers: number;
  activeSkills: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalValue: 0,
    dailyChange: 0,
    totalUsers: 0,
    activeSkills: 0,
  });

  useEffect(() => {
    loadStats();
    
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stocks' },
        () => loadStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStats = async () => {
    try {
      // Загрузка статистики
      const [usersResult, skillsResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('skills').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      ]);

      setStats({
        totalValue: 125000, // Заглушка
        dailyChange: 5.2,
        totalUsers: usersResult.count || 0,
        activeSkills: skillsResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    {
      label: 'Portfolio Value',
      value: formatCurrency(stats.totalValue),
      change: stats.dailyChange,
      icon: DollarSign,
      color: 'primary',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: 12.5,
      icon: Users,
      color: 'success',
    },
    {
      label: 'Active Skills',
      value: stats.activeSkills.toLocaleString(),
      change: 8.3,
      icon: Target,
      color: 'warning',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    isPositive ? 'text-success' : 'text-danger'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{formatPercentage(stat.change)}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-sm text-dark-muted">{stat.label}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <h2 className="text-xl font-bold mb-4">Price Chart</h2>
            <PriceChart />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <h2 className="text-xl font-bold mb-4">Portfolio Overview</h2>
            <PortfolioOverview />
          </Card>
        </motion.div>
      </div>

      {/* Market Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <h2 className="text-xl font-bold mb-4">Top Skills</h2>
          <MarketTable />
        </Card>
      </motion.div>
    </div>
  );
}
