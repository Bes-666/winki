'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  Target, 
  Trophy,
  MessageSquare,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/market', icon: TrendingUp, label: 'Market' },
  { href: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { href: '/skills', icon: Target, label: 'My Skills' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

const adminItems = [
  { href: '/admin', icon: Shield, label: 'Admin Panel' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-dark-card rounded-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'w-64 glass-effect border-r border-dark-border p-6 fixed md:static h-full z-40 transition-transform',
          'md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-500/20 text-primary-400 border-l-2 border-primary-500'
                      : 'text-dark-muted hover:bg-dark-card hover:text-dark-text'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}

          {/* Admin section */}
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-dark-border">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        isActive
                          ? 'bg-warning/20 text-warning border-l-2 border-warning'
                          : 'text-dark-muted hover:bg-dark-card hover:text-dark-text'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
        
        <div className="mt-8 p-4 bg-dark-card rounded-lg border border-dark-border">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium">Telegram Bot</span>
          </div>
          <p className="text-xs text-dark-muted">
            Управляйте через бота в Telegram
          </p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}


