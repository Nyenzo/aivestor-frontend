'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';

export default function HistoricalSparkline({ symbol, color }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const token = localStorage.getItem('token');
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

                // Fetch 1 month of daily data for the sparkline
                const response = await axios.get(`${API_URL}/api/history/${symbol}?period=1mo`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.data) {
                    setData(response.data.data);
                }
            } catch (err) {
                console.error(`Error fetching history for ${symbol}:`, err);
            } finally {
                setLoading(false);
            }
        }

        if (symbol) {
            fetchHistory();
        }
    }, [symbol]);

    if (loading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-end pb-2">
                <div className="animate-pulse bg-white/5 w-full h-1/2 rounded-t-lg"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-xs text-white/20 font-mono">
                No History
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                    </linearGradient>
                </defs>
                <YAxis domain={['auto', 'auto']} hide />
                <Area
                    type="monotone"
                    dataKey="price"
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#gradient-${symbol})`}
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
