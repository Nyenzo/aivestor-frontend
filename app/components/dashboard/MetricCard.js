export default function MetricCard({ title, value, icon, trend, trendValue, iconBgClass, iconColorClass, trendBgClass, trendColorClass, children }) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${iconBgClass || 'bg-primary/5'} ${iconColorClass || 'text-primary'}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                {trendValue && (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${trendBgClass || 'bg-emerald-custom/10'} ${trendColorClass || 'text-emerald-custom'}`}>
                        {trend === 'up' ? '+' : ''}{trendValue}
                    </span>
                )}
            </div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
            {children && (
                <div className="mt-4 flex-1">
                    {children}
                </div>
            )}
        </div>
    );
}
