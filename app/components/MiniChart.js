// Mini chart component for stock price visualization
'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function MiniChart({ data = [], isPositive = true, className = '' }) {
  const chartData = data.filter((point) => Number.isFinite(point?.value));

  if (chartData.length === 0) {
    return <div className={`w-full h-12 ${className}`} aria-hidden="true" />;
  }

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
