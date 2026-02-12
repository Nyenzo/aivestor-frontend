// Stock item component for portfolio display
'use client';

import { TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import MiniChart from './MiniChart';

export default function StockItem({ 
  symbol, 
  name, 
  price, 
  change, 
  changePercent, 
  chartData = [],
  shares = null,
  totalValue = null,
  showValue = true 
}) {
  const isPositive = change >= 0;

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-200 border border-gray-700/50 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold text-lg">{symbol}</h3>
            {shares && (
              <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded">
                {shares} shares
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm truncate">{name}</p>
        </div>
        <div className="text-right">
          <div className="text-white font-semibold text-lg">
            {price.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 2 
            })}
          </div>
          <div className={`flex items-center justify-end gap-1 text-sm font-medium ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Mini chart */}
      <div className="mb-3">
        <MiniChart data={chartData} isPositive={isPositive} />
      </div>

      {/* Total value if shares provided */}
      {totalValue && showValue && (
        <div className="pt-3 border-t border-gray-700/50 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Total Value</span>
          <span className="text-white font-semibold">
            {totalValue.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            })}
          </span>
        </div>
      )}

      {/* After hours change indicator */}
      {Math.random() > 0.5 && (
        <div className="pt-2 flex items-center gap-2 text-xs text-gray-500">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
          After hours: {(Math.random() * 2 - 1).toFixed(2)}%
        </div>
      )}
    </div>
  );
}
