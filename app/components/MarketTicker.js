// Stock ticker component for scrolling market prices
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const MARKET_SYMBOLS = 'AAPL,MSFT,NVDA,AMZN,GOOGL,META,TSLA,^GSPC,^DJI,^IXIC,GC=F,CL=F,BTC-USD,ETH-USD';
const CACHE_KEY = 'aivestor.marketTicker.v1';
const CACHE_TTL_MS = 30000;

async function fetchLiveMarkets() {
  const cached = readCachedMarkets();
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) return cached.data;

  const bases = Array.from(new Set([
    process.env.NEXT_PUBLIC_API_URL,
    'http://localhost:5005',
    'http://localhost:5000',
  ].filter(Boolean)));

  let lastError;
  for (const base of bases) {
    try {
      const response = await fetch(`${base}/api/market/quotes?symbols=${encodeURIComponent(MARKET_SYMBOLS)}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const data = await response.json();
      const markets = (data.quotes || []).map((quote) => ({
        symbol: quote.symbol.replace(/^\^/, '').replace('-USD', ''),
        price: Number(quote.price) || 0,
        change: Number(quote.changePercent) || 0,
        isPositive: Number(quote.changePercent) >= 0,
      }));
      writeCachedMarkets(markets);
      return markets;
    } catch (error) {
      lastError = error;
    }
  }

  if (cached?.data?.length) return cached.data;
  throw lastError || new Error('Unable to load Yahoo Finance market data');
}

function readCachedMarkets() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCachedMarkets(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ cachedAt: Date.now(), data }));
  } catch {}
}

export default function MarketTicker({ markets = [] }) {
  const [tickerData, setTickerData] = useState(markets);

  useEffect(() => {
    if (markets && markets.length > 0) {
      setTickerData(markets);
      return;
    }

    let cancelled = false;
    fetchLiveMarkets()
      .then((data) => {
        if (!cancelled) setTickerData(data);
      })
      .catch(() => {
        if (!cancelled) setTickerData([]);
      });

    return () => {
      cancelled = true;
    };
  }, [markets]);

  if (tickerData.length === 0) return null;

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
