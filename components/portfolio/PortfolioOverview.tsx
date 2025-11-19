'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PortfolioItem {
  skill_name: string;
  shares: number;
  currentPrice: number;
  value: number;
  profit: number;
  profitPercent: number;
}

export default function PortfolioOverview() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  useEffect(() => {
    // Загрузка данных портфеля (заглушка)
    // В реальном приложении нужно получать из API
    setItems([
      { skill_name: 'Python', shares: 10, currentPrice: 120, value: 1200, profit: 200, profitPercent: 20 },
      { skill_name: 'JavaScript', shares: 5, currentPrice: 150, value: 750, profit: 50, profitPercent: 7.14 },
    ]);
    setTotalValue(1950);
    setTotalProfit(250);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-dark-card rounded-lg">
        <span className="text-dark-muted">Total Value</span>
        <span className="text-2xl font-bold">{formatCurrency(totalValue)}</span>
      </div>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="p-4 bg-dark-card rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{item.skill_name}</span>
              <span className={cn(
                'font-semibold',
                item.profit >= 0 ? 'text-success' : 'text-danger'
              )}>
                {formatPercentage(item.profitPercent)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-dark-muted">
              <span>{item.shares} shares</span>
              <span>{formatCurrency(item.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


