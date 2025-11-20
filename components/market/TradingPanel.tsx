'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { Zap, Target, AlertTriangle } from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface TradingPanelProps {
  skillId?: string;
  currentPrice?: number;
  balance?: number;
}

export default function TradingPanel({ 
  skillId, 
  currentPrice = 140.50,
  balance = 1000 
}: TradingPanelProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('limit');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(currentPrice.toString());
  const [stopPrice, setStopPrice] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');

  const total = parseFloat(price || '0') * parseFloat(amount || '0');
  const availableBalance = side === 'buy' ? balance : 0; // TODO: получить реальный баланс

  const handlePercentageClick = (percent: number) => {
    if (orderType === 'market') {
      const maxAmount = availableBalance / currentPrice;
      setAmount((maxAmount * (percent / 100)).toFixed(2));
    } else {
      const maxAmount = availableBalance / parseFloat(price || currentPrice.toString());
      setAmount((maxAmount * (percent / 100)).toFixed(2));
    }
  };

  const handleTrade = async () => {
    if (!skillId || !amount || (orderType !== 'market' && !price)) {
      return;
    }

    // TODO: Реализовать логику покупки/продажи
    console.log('Trade:', { 
      side, 
      orderType,
      skillId, 
      amount, 
      price: orderType === 'market' ? currentPrice : price,
      total,
      stopPrice,
      takeProfit,
      stopLoss
    });
  };

  return (
    <div className="space-y-4">
      {/* Buy/Sell переключатель */}
      <div className="flex gap-2">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            side === 'buy'
              ? 'bg-success text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            side === 'sell'
              ? 'bg-danger text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Тип ордера */}
      <div className="flex gap-2">
        <button
          onClick={() => setOrderType('market')}
          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
            orderType === 'market'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text'
          }`}
        >
          <Zap className="w-3 h-3" />
          Market
        </button>
        <button
          onClick={() => setOrderType('limit')}
          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
            orderType === 'limit'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text'
          }`}
        >
          <Target className="w-3 h-3" />
          Limit
        </button>
        <button
          onClick={() => setOrderType('stop')}
          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
            orderType === 'stop'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-card text-dark-muted hover:text-dark-text'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          Stop
        </button>
      </div>

      <div className="space-y-3">
        {/* Цена */}
        {orderType !== 'market' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-dark-text">Price</label>
              <span className="text-xs text-dark-muted">Market: {formatCurrency(currentPrice)}</span>
            </div>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
        )}

        {orderType === 'market' && (
          <div className="p-3 bg-dark-card rounded-lg border border-dark-border">
            <div className="text-xs text-dark-muted mb-1">Market Price</div>
            <div className="text-xl font-mono font-bold text-primary-400">
              {formatCurrency(currentPrice)}
            </div>
          </div>
        )}

        {/* Количество */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-dark-text">Amount</label>
            <div className="flex gap-1">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={() => handlePercentageClick(percent)}
                  className="px-2 py-0.5 text-xs bg-dark-card hover:bg-dark-border rounded text-dark-muted hover:text-dark-text transition-colors"
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            step="0.01"
          />
        </div>

        {/* Stop Loss / Take Profit */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-dark-muted mb-1 block">Stop Loss</label>
            <Input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-dark-muted mb-1 block">Take Profit</label>
            <Input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="text-sm"
            />
          </div>
        </div>

        {/* Итого */}
        <div className="pt-3 border-t border-dark-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-dark-muted">Total</span>
            <span className="font-mono font-semibold">
              {formatCurrency(orderType === 'market' ? currentPrice * parseFloat(amount || '0') : total)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-dark-muted">Available</span>
            <span className="font-mono text-dark-muted">
              {formatCurrency(availableBalance)}
            </span>
          </div>
        </div>

        {/* Кнопка торговли */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant={side === 'buy' ? 'success' : 'danger'}
            className="w-full py-4 font-bold"
            onClick={handleTrade}
            disabled={!amount || (orderType !== 'market' && !price) || total === 0}
          >
            {orderType === 'market' ? 'Market' : orderType === 'limit' ? 'Limit' : 'Stop'} {side === 'buy' ? 'Buy' : 'Sell'}
          </Button>
        </motion.div>

        {orderType === 'stop' && (
          <div className="p-2 bg-warning/10 border border-warning/20 rounded text-xs text-warning">
            Stop order will execute when price reaches {formatCurrency(parseFloat(price || '0'))}
          </div>
        )}
      </div>
    </div>
  );
}


