'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface LeaderboardEntry {
  rank: number;
  username?: string;
  value: number;
  change?: number;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'investors' | 'players' | 'skills'>('investors');
  const [investors, setInvestors] = useState<LeaderboardEntry[]>([]);
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [skills, setSkills] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);

      if (activeTab === 'investors') {
        const { data, error } = await supabase
          .from('users')
          .select('username, balance')
          .order('balance', { ascending: false })
          .limit(50);

        if (!error && data) {
          setInvestors(
            data.map((user, index) => ({
              rank: index + 1,
              username: user.username || 'Unknown',
              value: user.balance,
            }))
          );
        }
      } else if (activeTab === 'players') {
        const { data, error } = await supabase
          .from('skills')
          .select(`
            level,
            experience,
            users!skills_user_id_fkey (
              username
            )
          `)
          .eq('status', 'approved')
          .order('level', { ascending: false })
          .order('experience', { ascending: false })
          .limit(50);

        if (!error && data) {
          setPlayers(
            data.map((skill: any, index) => ({
              rank: index + 1,
              username: skill.users?.username || 'Unknown',
              value: skill.level * 1000 + skill.experience,
            }))
          );
        }
      } else if (activeTab === 'skills') {
        const { data, error } = await supabase
          .from('stocks')
          .select(`
            market_cap,
            skills (
              name
            )
          `)
          .order('market_cap', { ascending: false })
          .limit(50);

        if (!error && data) {
          setSkills(
            data.map((stock: any, index) => ({
              rank: index + 1,
              username: stock.skills?.name || 'Unknown',
              value: stock.market_cap || 0,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Badge variant="warning">🥇</Badge>;
    } else if (rank === 2) {
      return <Badge variant="info">🥈</Badge>;
    } else if (rank === 3) {
      return <Badge variant="default">🥉</Badge>;
    }
    return <span className="text-dark-muted">#{rank}</span>;
  };

  const renderTable = (data: LeaderboardEntry[], valueLabel: string) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-12 text-dark-muted">
          No data available
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">{valueLabel}</TableHead>
            {activeTab === 'investors' && <TableHead className="text-right">Change</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>
                {getRankBadge(entry.rank)}
              </TableCell>
              <TableCell>
                <div className="font-medium">@{entry.username}</div>
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {activeTab === 'skills'
                  ? formatCurrency(entry.value)
                  : activeTab === 'investors'
                  ? formatCurrency(entry.value)
                  : formatNumber(entry.value)}
              </TableCell>
              {activeTab === 'investors' && (
                <TableCell className="text-right text-sm text-success">
                  +5.2%
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="w-8 h-8 text-warning" />
          Leaderboard
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('investors')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'investors'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Top Investors
        </button>
        <button
          onClick={() => setActiveTab('players')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'players'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Top Players
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'skills'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text'
          }`}
        >
          <Award className="w-4 h-4 inline mr-2" />
          Top Skills
        </button>
      </div>

      {/* Leaderboard Table */}
      <Card>
        {activeTab === 'investors' && renderTable(investors, 'Balance')}
        {activeTab === 'players' && renderTable(players, 'Total XP')}
        {activeTab === 'skills' && renderTable(skills, 'Market Cap')}
      </Card>
    </div>
  );
}


