'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, CandlestickData, Time, UTCTimestamp } from 'lightweight-charts';
import { formatCurrency } from '@/lib/utils';

interface CandlestickDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandlestickChartProps {
  data?: CandlestickDataPoint[];
  height?: number;
  skillName?: string;
}

export default function CandlestickChart({ 
  data, 
  height = 500,
  skillName = 'Skill'
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('1h');

  // Генерация тестовых данных с китайскими свечами
  const generateMockData = (): CandlestickDataPoint[] => {
    const mockData: CandlestickDataPoint[] = [];
    let basePrice = 120;
    const now = Date.now();
    
    for (let i = 100; i >= 0; i--) {
      const time = new Date(now - i * 60 * 60 * 1000); // каждый час
      const open = basePrice;
      const volatility = Math.random() * 10 - 5;
      const close = open + volatility;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      const volume = Math.random() * 1000 + 500;
      
      mockData.push({
        time: time.toISOString(),
        open,
        high,
        low,
        close,
        volume,
      });
      
      basePrice = close;
    }
    
    return mockData;
  };

  const chartData = data || generateMockData();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Создание графика
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0e27' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: {
          color: '#1a1f3a',
          style: 1,
        },
        horzLines: {
          color: '#1a1f3a',
          style: 1,
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2a2f4a',
      },
      rightPriceScale: {
        borderColor: '#2a2f4a',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#0ea5e9',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0ea5e9',
        },
        horzLine: {
          color: '#0ea5e9',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0ea5e9',
        },
      },
    });

    chartRef.current = chart;

    // Создание серии китайских свечей
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Создание серии объема
    const volumeSeries = chart.addHistogramSeries({
      color: '#0ea5e9',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });
    
    // Настройка масштаба для объема
    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    volumeSeriesRef.current = volumeSeries;

    // Преобразование данных
    const candlestickData: CandlestickData[] = chartData.map((item) => ({
      time: (new Date(item.time).getTime() / 1000) as UTCTimestamp,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    const volumeData = chartData.map((item) => ({
      time: (new Date(item.time).getTime() / 1000) as UTCTimestamp,
      value: item.volume || 0,
      color: item.close >= item.open ? '#10b98180' : '#ef444480',
    }));

    candlestickSeries.setData(candlestickData);
    volumeSeries.setData(volumeData);

    // Добавление Moving Average
    const maSeries = chart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      title: 'MA 20',
    });

    // Расчет MA
    const maData = [];
    const period = 20;
    for (let i = period - 1; i < candlestickData.length; i++) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += candlestickData[j].close;
      }
      maData.push({
        time: candlestickData[i].time,
        value: sum / period,
      });
    }
    maSeries.setData(maData);

    // Адаптация размера
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartData, height]);

  return (
    <div className="w-full">
      {/* Toolbar с таймфреймами */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-dark-muted">Timeframe:</span>
          {(['1m', '5m', '15m', '1h', '4h', '1d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-card text-dark-muted hover:text-dark-text'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="text-sm text-dark-muted">
          {skillName}
        </div>
      </div>

      {/* График */}
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />

      {/* Легенда с текущими ценами */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-dark-muted mb-1">Open</div>
          <div className="font-mono font-semibold">
            {chartData.length > 0 ? formatCurrency(chartData[chartData.length - 1].open) : '-'}
          </div>
        </div>
        <div>
          <div className="text-dark-muted mb-1">High</div>
          <div className="font-mono font-semibold text-success">
            {chartData.length > 0 ? formatCurrency(chartData[chartData.length - 1].high) : '-'}
          </div>
        </div>
        <div>
          <div className="text-dark-muted mb-1">Low</div>
          <div className="font-mono font-semibold text-danger">
            {chartData.length > 0 ? formatCurrency(chartData[chartData.length - 1].low) : '-'}
          </div>
        </div>
        <div>
          <div className="text-dark-muted mb-1">Close</div>
          <div className="font-mono font-semibold">
            {chartData.length > 0 ? formatCurrency(chartData[chartData.length - 1].close) : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}

