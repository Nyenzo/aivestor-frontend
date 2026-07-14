'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export default function AnalyticsBarChart({ symbol = 'BTC-USD', period = '1mo' }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const token = localStorage.getItem('token');
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

                const response = await axios.get(`${API_URL}/api/history/${symbol}?period=${period}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.data) {
                    // Add a `color` field based on price change
                    const processed = response.data.data.map((d, i, arr) => {
                        const prevPrice = i > 0 ? arr[i - 1].price : d.price;
                        return {
                            ...d,
                            color: d.price >= prevPrice ? '#0df259' : '#f02e9b'
                        }
                    });
                    setData(processed);
                }
            } catch (err) {
                console.error(`Error fetching analytics history:`, err);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [symbol, period]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse bg-[#1a2c20]/50 w-full h-full rounded-lg"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-sm">
                No Market Data
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#28392e" vertical={false} />
                <XAxis
                    dataKey="date"
                    stroke="#475569"
                    tickFormatter={(tick) => {
                        const date = new Date(tick);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                    minTickGap={30}
                />
                <YAxis
                    domain={['auto', 'auto']}
                    stroke="#475569"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#0f1115', borderColor: '#28392e', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Price']}
                />
                <Bar dataKey="price" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
