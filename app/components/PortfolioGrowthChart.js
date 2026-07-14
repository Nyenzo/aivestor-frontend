'use client';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function PortfolioGrowthChart() {
    // Simulated historical growth data
    const data = [
        { date: 'Oct 01', value: 95000 },
        { date: 'Oct 05', value: 100000 },
        { date: 'Oct 10', value: 98000 },
        { date: 'Oct 15', value: 105000 },
        { date: 'Oct 20', value: 115000 },
        { date: 'Oct 24', value: 124592 },
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorValueGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0df259" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#0df259" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="date" hide={true} />
                <YAxis domain={['dataMin - 10000', 'dataMax + 10000']} hide={true} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#0df259', fontWeight: 'bold' }}
                    formatter={(val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)}
                    labelStyle={{ display: 'none' }}
                />
                <Area type="monotone" dataKey="value" stroke="#0df259" strokeWidth={4} fillOpacity={1} fill="url(#colorValueGrowth)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
