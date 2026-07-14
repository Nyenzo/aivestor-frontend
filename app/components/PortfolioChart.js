// Portfolio performance chart component
'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function PortfolioChart({ data = [], timeframe = '1D' }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  
  // Generate chart data based on timeframe
  const chartData = data.length > 0 ? data : generateChartData(selectedTimeframe);
  
  const timeframes = [
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '1Y', value: '1Y' },
    { label: 'ALL', value: 'ALL' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{payload[0].payload.date}</p>
          <p className="text-white font-semibold">
            ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          {payload[0].payload.change && (
            <p className={`text-sm ${payload[0].payload.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {payload[0].payload.change >= 0 ? '+' : ''}{payload[0].payload.change.toFixed(2)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const isPositive = chartData.length > 1 && chartData[chartData.length - 1].value > chartData[0].value;

  return (
    <div className="w-full">
      {}
      <div className="flex gap-2 mb-4">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setSelectedTimeframe(tf.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedTimeframe === tf.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {}
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="5%" 
                  stopColor={isPositive ? '#22c55e' : '#ef4444'} 
                  stopOpacity={0.3}
                />
                <stop 
                  offset="95%" 
                  stopColor={isPositive ? '#22c55e' : '#ef4444'} 
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickLine={{ stroke: '#374151' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth={2}
              fill="url(#colorValue)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function generateChartData(timeframe) {
  const points = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '1Y' ? 365 : 1825;
  const data = [];
  let value = 25000;
  
  for (let i = 0; i < points; i++) {
    const date = subDays(new Date(), points - i);
    const change = (Math.random() - 0.48) * 500; // Slightly positive bias
    value += change;
    
    data.push({
      date: timeframe === '1D' 
        ? format(date, 'HH:mm')
        : points > 365
        ? format(date, 'MMM yy')
        : points > 90
        ? format(date, 'MMM dd')
        : format(date, 'MMM dd'),
      value: Math.max(value, 1000),
      change: (change / value) * 100,
    });
  }
  
  return data;
}
