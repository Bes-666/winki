'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import MarketTable from '@/components/market/MarketTable';
import PriceChart from '@/components/market/PriceChart';
import TradingPanel from '@/components/market/TradingPanel';
import OrderBook from '@/components/market/OrderBook';

export default function MarketPage() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Market</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Table - занимает 2 колонки */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-bold mb-4">All Skills</h2>
            <MarketTable />
          </Card>
        </div>

        {/* Trading Panel и Order Book - занимают 1 колонку */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold mb-4">Trading</h2>
            <TradingPanel 
              skillId={selectedSkill || undefined}
              currentPrice={selectedPrice}
            />
          </Card>

          <Card>
            <h2 className="text-xl font-bold mb-4">Order Book</h2>
            <OrderBook />
          </Card>
        </div>
      </div>

      {/* Price Chart */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Price Chart</h2>
        <PriceChart />
      </Card>
    </div>
  );
}


