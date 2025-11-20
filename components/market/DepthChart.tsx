'use client';

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, AreaData, UTCTimestamp } from 'lightweight-charts';

interface DepthData {
  price: number;
  buyVolume: number;
  sellVolume: number;
}

interface DepthChartProps {
  data?: DepthData[];
  height?: number;
}

export default function DepthChart({ data, height = 300 }: DepthChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const buySeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const sellSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  // Генерация тестовых данных глубины рынка
  const generateMockData = (): DepthData[] => {
    const mockData: DepthData[] = [];
    const basePrice = 140;
    
    // Buy orders (слева от цены)
    for (let i = 20; i >= 0; i--) {
      const price = basePrice - i * 0.5;
      mockData.push({
        price,
        buyVolume: Math.random() * 1000 + 100,
        sellVolume: 0,
      });
    }
    
    // Sell orders (справа от цены)
    for (let i = 1; i <= 20; i++) {
      const price = basePrice + i * 0.5;
      mockData.push({
        price,
        buyVolume: 0,
        sellVolume: Math.random() * 1000 + 100,
      });
    }
    
    return mockData.sort((a, b) => a.price - b.price);
  };

  const chartData = data || generateMockData();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0e27' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#1a1f3a' },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        visible: false,
      },
      rightPriceScale: {
        borderColor: '#2a2f4a',
      },
      crosshair: {
        mode: 0,
      },
    });

    chartRef.current = chart;

    // Buy side (зеленый)
    const buySeries = chart.addAreaSeries({
      lineColor: '#10b981',
      topColor: '#10b98140',
      bottomColor: '#10b98100',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    // Sell side (красный)
    const sellSeries = chart.addAreaSeries({
      lineColor: '#ef4444',
      topColor: '#ef444440',
      bottomColor: '#ef444400',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    buySeriesRef.current = buySeries;
    sellSeriesRef.current = sellSeries;

    // Преобразование данных
    const now = Math.floor(Date.now() / 1000) as UTCTimestamp;
    const buyData: AreaData[] = [];
    const sellData: AreaData[] = [];

    chartData.forEach((item) => {
      if (item.buyVolume > 0) {
        buyData.push({
          time: now,
          value: item.price,
        });
      }
      if (item.sellVolume > 0) {
        sellData.push({
          time: now,
          value: item.price,
        });
      }
    });

    // Альтернативный подход - используем цену как значение
    const buyDepthData: AreaData[] = chartData
      .filter(item => item.buyVolume > 0)
      .map((item, index) => ({
        time: (now - (chartData.length - index) * 60) as UTCTimestamp,
        value: item.price,
      }));

    const sellDepthData: AreaData[] = chartData
      .filter(item => item.sellVolume > 0)
      .map((item, index) => ({
        time: (now - (chartData.length - index) * 60) as UTCTimestamp,
        value: item.price,
      }));

    buySeries.setData(buyDepthData);
    sellSeries.setData(sellDepthData);

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
      <div className="flex items-center justify-between mb-2 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success rounded"></div>
            <span className="text-dark-muted">Buy Orders</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-danger rounded"></div>
            <span className="text-dark-muted">Sell Orders</span>
          </div>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
}

