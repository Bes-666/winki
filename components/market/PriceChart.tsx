'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  data?: Array<{ time: string; price: number }>;
}

const mockData = [
  { time: '00:00', price: 120 },
  { time: '04:00', price: 125 },
  { time: '08:00', price: 130 },
  { time: '12:00', price: 128 },
  { time: '16:00', price: 135 },
  { time: '20:00', price: 140 },
];

export default function PriceChart({ data = mockData }: PriceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2f4a" />
        <XAxis 
          dataKey="time" 
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1f3a',
            border: '1px solid #2a2f4a',
            borderRadius: '8px',
            color: '#e2e8f0',
          }}
          labelStyle={{ color: '#e2e8f0' }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
        />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#0ea5e9" 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}


