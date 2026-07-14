"use client";

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
const MARKET_SYMBOLS = 'AAPL,MSFT,NVDA,TSLA,^GSPC,^DJI,^IXIC,GC=F,CL=F,BTC-USD';
const CACHE_KEY = 'aivestor.tickerTape.v1';
const CACHE_TTL_MS = 30000;

export default function TickerTape() {
    const [quotes, setQuotes] = useState({});

    useEffect(() => {
        try {
            const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
            if (cached?.quotes && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
                setQuotes(cached.quotes);
            }
        } catch {}

        fetch(`${API_URL}/api/market/quotes?symbols=${encodeURIComponent(MARKET_SYMBOLS)}`, { cache: 'no-store' })
            .then((response) => response.ok ? response.json() : null)
            .then((data) => {
                if (!data?.quotes) return;
                const nextQuotes = Object.fromEntries(data.quotes.map((quote) => [quote.symbol, {
                    ticker: quote.symbol,
                    price: quote.price,
                    changePercent: quote.changePercent,
                }]));
                setQuotes(nextQuotes);
                try {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ cachedAt: Date.now(), quotes: nextQuotes }));
                } catch {}
            })
            .catch(() => {});

        const socket = io(API_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        socket.on('price_update', (data) => {
            setQuotes(prev => ({
                ...prev,
                [data.ticker]: data
            }));
        });

        return () => socket.disconnect();
    }, []);

    const tickerList = Object.values(quotes);

    // Do not render anything until we have stream data
    if (tickerList.length === 0) return null;

    return (
        <div className="w-full bg-slate-900 border-b border-slate-700 overflow-hidden py-1.5 flex text-xs font-mono select-none z-50 fixed top-0 left-0 right-0">
            <div className="flex animate-ticker whitespace-nowrap">
                { }
                {[...tickerList, ...tickerList, ...tickerList, ...tickerList].map((quote, idx) => (
                    <div key={`${quote.ticker}-${idx}`} className="flex items-center mx-6 gap-2">
                        <span className="text-white font-bold">{quote.ticker.replace('^', '')}</span>
                        <span className="text-slate-300">{quote.price.toFixed(2)}</span>
                        <span className={`flex items-center font-bold ${quote.changePercent >= 0 ? "text-primary" : "text-red-500"}`}>
                            {quote.changePercent >= 0 ? "▲" : "▼"} {Math.abs(quote.changePercent).toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
            <style jsx>{`
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        @keyframes ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
        </div>
    );
}
