'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface Order {
  price: number;
  amount: number;
  total: number;
}

export default function OrderBook() {
  const [buyOrders, setBuyOrders] = useState<Order[]>([
    { price: 140.50, amount: 10, total: 1405 },
    { price: 140.25, amount: 15, total: 2103.75 },
    { price: 140.00, amount: 20, total: 2800 },
    { price: 139.75, amount: 25, total: 3493.75 },
    { price: 139.50, amount: 30, total: 4185 },
  ]);

  const [sellOrders, setSellOrders] = useState<Order[]>([
    { price: 140.75, amount: 12, total: 1689 },
    { price: 141.00, amount: 18, total: 2538 },
    { price: 141.25, amount: 22, total: 3107.5 },
    { price: 141.50, amount: 28, total: 3962 },
    { price: 141.75, amount: 35, total: 4961.25 },
  ]);

  const [spread, setSpread] = useState(0.25);

  // Симуляция обновления ордеров
  useEffect(() => {
    const interval = setInterval(() => {
      // Обновляем некоторые ордера
      setBuyOrders((prev) =>
        prev.map((order) => ({
          ...order,
          amount: order.amount + (Math.random() * 2 - 1),
          total: order.price * (order.amount + (Math.random() * 2 - 1)),
        }))
      );

      setSellOrders((prev) =>
        prev.map((order) => ({
          ...order,
          amount: order.amount + (Math.random() * 2 - 1),
          total: order.price * (order.amount + (Math.random() * 2 - 1)),
        }))
      );

      setSpread((prev) => prev + (Math.random() * 0.1 - 0.05));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const bestBid = buyOrders[0]?.price || 0;
  const bestAsk = sellOrders[0]?.price || 0;
  const currentSpread = bestAsk - bestBid;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-danger">Sell Orders</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellOrders.map((order, index) => {
              const cumulativeTotal = sellOrders
                .slice(0, index + 1)
                .reduce((sum, o) => sum + o.total, 0);
              const maxTotal = sellOrders.reduce((sum, o) => sum + o.total, 0);
              const widthPercent = (cumulativeTotal / maxTotal) * 100;

              return (
                <TableRow 
                  key={index}
                  className="relative hover:bg-danger/10"
                >
                  <TableCell className="relative p-0">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-danger/10"
                      style={{ width: `${widthPercent}%` }}
                    />
                    <div className="relative text-right font-mono text-danger py-2 px-4">
                      {formatCurrency(order.price)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-dark-muted relative z-10">
                    {formatNumber(order.amount)}
                  </TableCell>
                  <TableCell className="text-right font-mono relative z-10">
                    {formatCurrency(order.total)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Spread и текущая цена */}
      <div className="text-center py-4 bg-dark-card rounded-lg border border-dark-border">
        <div className="grid grid-cols-3 gap-4 mb-2">
          <div>
            <div className="text-xs text-dark-muted mb-1">Best Bid</div>
            <div className="text-lg font-mono font-semibold text-success">
              {formatCurrency(bestBid)}
            </div>
          </div>
          <div>
            <div className="text-xs text-dark-muted mb-1">Spread</div>
            <div className="text-lg font-mono font-semibold text-warning">
              {formatCurrency(currentSpread)}
            </div>
          </div>
          <div>
            <div className="text-xs text-dark-muted mb-1">Best Ask</div>
            <div className="text-lg font-mono font-semibold text-danger">
              {formatCurrency(bestAsk)}
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold text-primary-400 font-mono">
          {formatCurrency((bestBid + bestAsk) / 2)}
        </div>
        <div className="text-xs text-dark-muted mt-1">Last Price</div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-success">Buy Orders</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buyOrders.map((order, index) => {
              const cumulativeTotal = buyOrders
                .slice(0, index + 1)
                .reduce((sum, o) => sum + o.total, 0);
              const maxTotal = buyOrders.reduce((sum, o) => sum + o.total, 0);
              const widthPercent = (cumulativeTotal / maxTotal) * 100;

              return (
                <TableRow 
                  key={index}
                  className="relative hover:bg-success/10"
                >
                  <TableCell className="relative p-0">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-success/10"
                      style={{ width: `${widthPercent}%` }}
                    />
                    <div className="relative text-right font-mono text-success py-2 px-4">
                      {formatCurrency(order.price)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-dark-muted relative z-10">
                    {formatNumber(order.amount)}
                  </TableCell>
                  <TableCell className="text-right font-mono relative z-10">
                    {formatCurrency(order.total)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


