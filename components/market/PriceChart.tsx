'use client';

import { useState } from 'react';
import CandlestickChart from './CandlestickChart';
import DepthChart from './DepthChart';
import TradeHistory from './TradeHistory';
import { BarChart3, TrendingUp, Layers } from 'lucide-react';

interface PriceChartProps {
  data?: Array<{ time: string; price: number }>;
  skillName?: string;
}

export default function PriceChart({ data, skillName }: PriceChartProps) {
  const [chartType, setChartType] = useState<'candlestick' | 'depth'>('candlestick');

  return (
    <div className="space-y-4">
      {/* Переключатель типа графика */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setChartType('candlestick')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            chartType === 'candlestick'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Candlestick
        </button>
        <button
          onClick={() => setChartType('depth')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            chartType === 'depth'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text'
          }`}
        >
          <Layers className="w-4 h-4" />
          Depth
        </button>
      </div>

      {/* График */}
      <div className="bg-dark-card rounded-lg p-4">
        {chartType === 'candlestick' ? (
          <CandlestickChart skillName={skillName} height={500} />
        ) : (
          <DepthChart height={400} />
        )}
      </div>

      {/* История сделок */}
      <div className="bg-dark-card rounded-lg p-4">
        <TradeHistory />
      </div>
    </div>
  );
}


