'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Target, TrendingUp, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface AdminStats {
  totalUsers: number;
  totalSkills: number;
  pendingSkills: number;
  totalTransactions: number;
  totalVolume: number;
  activeInvestors: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSkills: 0,
    pendingSkills: 0,
    totalTransactions: 0,
    totalVolume: 0,
    activeInvestors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      const [
        usersResult,
        skillsResult,
        pendingSkillsResult,
        transactionsResult,
        portfoliosResult,
      ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('skills').select('id', { count: 'exact', head: true }),
        supabase.from('skills').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('transactions').select('total', { count: 'exact' }),
        supabase.from('portfolios').select('investor_id', { count: 'exact', head: true }),
      ]);

      const totalVolume = transactionsResult.data?.reduce((sum, tx) => sum + (tx.total || 0), 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalSkills: skillsResult.count || 0,
        pendingSkills: pendingSkillsResult.count || 0,
        totalTransactions: transactionsResult.count || 0,
        totalVolume,
        activeInvestors: portfoliosResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Users',
      value: formatNumber(stats.totalUsers),
      icon: Users,
      color: 'primary',
      link: '/admin/users',
    },
    {
      label: 'Total Skills',
      value: formatNumber(stats.totalSkills),
      icon: Target,
      color: 'success',
      link: '/admin/skills',
    },
    {
      label: 'Pending Skills',
      value: formatNumber(stats.pendingSkills),
      icon: AlertCircle,
      color: 'warning',
      link: '/admin/skills?status=pending',
    },
    {
      label: 'Total Transactions',
      value: formatNumber(stats.totalTransactions),
      icon: TrendingUp,
      color: 'info',
      link: '/admin/transactions',
    },
    {
      label: 'Total Volume',
      value: formatCurrency(stats.totalVolume),
      icon: DollarSign,
      color: 'primary',
      link: '/admin/transactions',
    },
    {
      label: 'Active Investors',
      value: formatNumber(stats.activeInvestors),
      icon: CheckCircle,
      color: 'success',
      link: '/admin/users',
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/skills?status=pending">
          <Button variant="warning" className="w-full">
            <AlertCircle className="w-4 h-4 mr-2" />
            Moderate Skills ({stats.pendingSkills})
          </Button>
        </Link>
        <Link href="/admin/users">
          <Button variant="primary" className="w-full">
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </Button>
        </Link>
        <Link href="/admin/transactions">
          <Button variant="success" className="w-full">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Transactions
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Link key={stat.label} href={stat.link}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:bg-dark-border transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-sm text-dark-muted">{stat.label}</p>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


