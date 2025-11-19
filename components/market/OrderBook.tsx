'use client';

import { formatCurrency } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface Order {
  price: number;
  amount: number;
  total: number;
}

export default function OrderBook() {
  // Заглушка данных
  const buyOrders: Order[] = [
    { price: 140.50, amount: 10, total: 1405 },
    { price: 140.25, amount: 15, total: 2103.75 },
    { price: 140.00, amount: 20, total: 2800 },
    { price: 139.75, amount: 25, total: 3493.75 },
    { price: 139.50, amount: 30, total: 4185 },
  ];

  const sellOrders: Order[] = [
    { price: 140.75, amount: 12, total: 1689 },
    { price: 141.00, amount: 18, total: 2538 },
    { price: 141.25, amount: 22, total: 3107.5 },
    { price: 141.50, amount: 28, total: 3962 },
    { price: 141.75, amount: 35, total: 4961.25 },
  ];

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
            {sellOrders.map((order, index) => (
              <TableRow key={index} className="hover:bg-danger/5">
                <TableCell className="text-right font-mono text-danger">
                  {formatCurrency(order.price)}
                </TableCell>
                <TableCell className="text-right font-mono text-dark-muted">
                  {order.amount}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(order.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-center py-2">
        <div className="text-2xl font-bold text-primary-400">
          {formatCurrency(140.50)}
        </div>
        <div className="text-sm text-dark-muted">Current Price</div>
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
            {buyOrders.map((order, index) => (
              <TableRow key={index} className="hover:bg-success/5">
                <TableCell className="text-right font-mono text-success">
                  {formatCurrency(order.price)}
                </TableCell>
                <TableCell className="text-right font-mono text-dark-muted">
                  {order.amount}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(order.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


