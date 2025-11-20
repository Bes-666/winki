'use client';

import { Bell, Settings, User, LogIn, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export default function Header() {
  const [balance, setBalance] = useState<number>(0);
  const [isLive, setIsLive] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Загрузка баланса пользователя (пока заглушка)
    // В реальном приложении нужно получать из контекста или пропсов
    setBalance(1000);

    // Проверяем, авторизован ли админ
    const adminToken = localStorage.getItem('admin_token');
    setIsAdmin(!!adminToken);
  }, [pathname]);

  return (
    <header className="glass-effect border-b border-dark-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            SkillStock
          </h1>
          <div className="hidden md:flex items-center gap-2 text-sm text-dark-muted">
            <motion.span
              animate={{ opacity: isLive ? [1, 0.5, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-3 py-1 bg-success/10 text-success rounded-full flex items-center gap-1.5"
            >
              <span className="w-2 h-2 bg-success rounded-full" />
              Live
            </motion.span>
            <span>24h Volume: $1,234,567</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-dark-card rounded-lg">
            <span className="text-sm text-dark-muted">Balance:</span>
            <span className="font-mono font-semibold text-primary-400">
              {formatCurrency(balance)}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-dark-card rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-dark-card rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-dark-card hover:bg-dark-border rounded-lg transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="hidden md:block">Profile</span>
          </motion.button>

          {isAdmin ? (
            <Link href="/admin">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-lg transition-colors"
              >
                <Shield className="w-5 h-5" />
                <span className="hidden md:block">Admin</span>
              </motion.button>
            </Link>
          ) : (
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden md:block">Login</span>
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}


