'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';
import Badge from '@/components/ui/Badge';

interface Trade {
  id: string;
  time: string;
  price: number;
  amount: number;
  type: 'buy' | 'sell';
}

export default function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // Генерация тестовых данных
    const generateTrades = (): Trade[] => {
      const mockTrades: Trade[] = [];
      const now = Date.now();
      const basePrice = 140;

      for (let i = 0; i < 20; i++) {
        mockTrades.push({
          id: `trade-${i}`,
          time: new Date(now - i * 1000).toISOString(),
          price: basePrice + (Math.random() * 4 - 2),
          amount: Math.random() * 10 + 1,
          type: Math.random() > 0.5 ? 'buy' : 'sell',
        });
      }

      return mockTrades.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    };

    setTrades(generateTrades());

    // Симуляция новых сделок
    const interval = setInterval(() => {
      const newTrade: Trade = {
        id: `trade-${Date.now()}`,
        time: new Date().toISOString(),
        price: 140 + (Math.random() * 4 - 2),
        amount: Math.random() * 10 + 1,
        type: Math.random() > 0.5 ? 'buy' : 'sell',
      };

      setTrades((prev) => [newTrade, ...prev.slice(0, 19)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-dark-muted">Recent Trades</h3>
        <div className="flex items-center gap-4 text-xs text-dark-muted">
          <span>Price</span>
          <span>Amount</span>
          <span>Time</span>
        </div>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {trades.map((trade, index) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center justify-between py-2 px-3 rounded text-sm ${
                trade.type === 'buy'
                  ? 'bg-success/5 hover:bg-success/10'
                  : 'bg-danger/5 hover:bg-danger/10'
              } transition-colors`}
            >
              <Badge
                variant={trade.type === 'buy' ? 'success' : 'danger'}
                size="sm"
              >
                {trade.type.toUpperCase()}
              </Badge>

              <div className="flex items-center gap-4 flex-1 justify-end">
                <span
                  className={`font-mono font-semibold ${
                    trade.type === 'buy' ? 'text-success' : 'text-danger'
                  }`}
                >
                  {formatCurrency(trade.price)}
                </span>
                <span className="font-mono text-dark-muted">
                  {formatNumber(trade.amount)}
                </span>
                <span className="text-xs text-dark-muted min-w-[60px]">
                  {format(new Date(trade.time), 'HH:mm:ss')}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

