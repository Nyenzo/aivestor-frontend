export default function ActivityLogItem({ title, description, timeAgo, icon, iconColorClass, iconBgClass }) {
    return (
        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex gap-4 items-start hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgClass || 'bg-primary/10'} ${iconColorClass || 'text-primary'}`}>
                <span className="material-symbols-outlined text-sm">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{description}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">{timeAgo}</p>
            </div>
        </div>
    );
}
