// Mini chart component for stock price visualization
'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function MiniChart({ data = [], isPositive = true, className = '' }) {
  // Generate dummy data if none provided
  const chartData = data.length > 0 ? data : generateDummyData(isPositive);

  return (
    <div className={`w-full h-12 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={isPositive ? '#22c55e' : '#ef4444'}
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function generateDummyData(isPositive) {
  const points = 20;
  const data = [];
  let value = 100;
  
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * 5;
    value += isPositive ? Math.abs(change) * 0.3 : -Math.abs(change) * 0.3;
    data.push({ value: value + Math.random() * 10 });
  }
  
  return data;
}
