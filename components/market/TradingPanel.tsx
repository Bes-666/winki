'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';

interface TradingPanelProps {
  skillId?: string;
  currentPrice?: number;
}

export default function TradingPanel({ skillId, currentPrice = 0 }: TradingPanelProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(currentPrice.toString());

  const total = parseFloat(price || '0') * parseFloat(amount || '0');

  const handleTrade = async () => {
    if (!skillId || !amount || !price) {
      return;
    }

    // TODO: Реализовать логику покупки/продажи
    console.log('Trade:', { side, skillId, amount, price, total });
  };

  return (
    <div className="space-y-6">
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

      <div className="space-y-4">
        <Input
          label="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          step="0.01"
        />

        <Input
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          step="1"
        />

        <div className="pt-4 border-t border-dark-border">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-dark-muted">Total</span>
            <span className="font-mono font-semibold">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant={side === 'buy' ? 'success' : 'danger'}
            className="w-full py-4"
            onClick={handleTrade}
            disabled={!amount || !price || total === 0}
          >
            {side === 'buy' ? 'Buy' : 'Sell'} SkillStock
          </Button>
        </motion.div>
      </div>
    </div>
  );
}


