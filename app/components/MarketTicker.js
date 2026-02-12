// Stock ticker component for scrolling market prices
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MarketTicker({ markets = [] }) {
  const [tickerData, setTickerData] = useState([
    { symbol: 'FTSE 100', price: 9722.31, change: 0.08, isPositive: true },
    { symbol: 'FTSE 250', price: 22025.06, change: 0.13, isPositive: true },
    { symbol: 'S&P 500', price: 5973.10, change: 0.38, isPositive: true },
    { symbol: 'DOW JONES', price: 43988.99, change: 0.59, isPositive: true },
    { symbol: 'NASDAQ', price: 19286.78, change: 0.09, isPositive: true },
    { symbol: 'DAX', price: 19254.97, change: -0.23, isPositive: false },
    { symbol: 'NIKKEI 225', price: 39500.37, change: 0.28, isPositive: true },
  ]);

  useEffect(() => {
    if (markets && markets.length > 0) {
      setTickerData(markets);
    }
  }, [markets]);

  // Duplicate the array for seamless loop
  const duplicatedTicker = [...tickerData, ...tickerData];

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 overflow-hidden">
      <div className="relative h-16 flex items-center">
        <motion.div
          className="flex gap-8 px-4"
          animate={{
            x: [0, -100 * tickerData.length],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {duplicatedTicker.map((item, index) => (
            <div
              key={`${item.symbol}-${index}`}
              className="flex items-center gap-3 min-w-fit whitespace-nowrap"
            >
              <span className="text-gray-400 font-medium text-sm">{item.symbol}</span>
              <span className="text-white font-semibold">
                {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center gap-1 text-sm font-medium ${
                item.isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {item.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {item.isPositive ? '+' : ''}{item.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
