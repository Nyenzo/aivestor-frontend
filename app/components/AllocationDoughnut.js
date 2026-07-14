'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#0df259', '#0ea5e9', '#a855f7'];

export default function AllocationDoughnut({ positions }) {
    if (!positions || positions.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono text-sm">
                No allocation data
            </div>
        );
    }

    const data = positions.map(pos => ({
        name: pos.stock_symbol || pos.symbol,
        value: Math.max((pos.current_price || pos.averagePrice || 1) * (pos.quantity || 0), 0)
    })).filter(pos => pos.value > 0);

    // Take top 2 + Others
    data.sort((a, b) => b.value - a.value);
    let finalData = data.slice(0, 2);
    if (data.length > 2) {
        const othersValue = data.slice(2).reduce((sum, item) => sum + item.value, 0);
        finalData.push({ name: 'Others', value: othersValue });
    }

    // Calculate total for percentage display
    const totalValue = finalData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={finalData}
                            cx="50%"
                            cy="50%"
                            innerRadius="65%"
                            outerRadius="90%"
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                        >
                            {finalData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1e1b', borderColor: '#27272a', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-4">
                    <span className="text-slate-400 text-xs font-medium">Total</span>
                    <span className="text-white font-bold text-xl">${(totalValue / 1000).toFixed(0)}k</span>
                </div>
            </div>
            <div className="w-full px-2 lg:px-6 flex flex-col gap-3 pb-2">
                {finalData.map((item, index) => (
                    <div key={item.name} className="flex justify-between items-center text-sm w-full">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-slate-300 font-medium">{item.name}</span>
                        </div>
                        <span className="text-white font-bold">{Math.round((item.value / totalValue) * 100)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
