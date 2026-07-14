'use client';

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#0df259', '#2563EB', '#059669', '#047857', '#064e3b', '#022c22'];

const CustomizedContent = (props) => {
    const { root, depth, x, y, width, height, index, name, value, bgColors } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={bgColors[index % bgColors.length]}
                stroke="#0f1115"
                strokeWidth={4}
                rx={8}
                ry={8}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer drop-shadow-md"
            />
            {width > 60 && height > 30 ? (
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    fill="#111"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-display font-bold text-sm pointer-events-none"
                >
                    {name}
                </text>
            ) : null}
        </g>
    );
};

export default function AllocationTreemap({ positions }) {
    if (!positions || positions.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-sm">
                No allocation data available.
            </div>
        );
    }

    // Format data for Recharts Treemap
    const data = positions.map(pos => ({
        name: pos.stock_symbol || pos.symbol,
        size: (pos.current_price || pos.averagePrice || 1) * (pos.quantity || 0)
    })).filter(pos => pos.size > 0);

    if (data.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-sm">
                Add positions to your portfolio to view allocation.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <Treemap
                data={data}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
                content={<CustomizedContent bgColors={COLORS} />}
            >
                <Tooltip
                    contentStyle={{ backgroundColor: '#0f1115', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#0df259' }}
                    formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                />
            </Treemap>
        </ResponsiveContainer>
    );
}
