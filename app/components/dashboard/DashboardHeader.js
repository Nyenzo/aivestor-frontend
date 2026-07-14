export default function DashboardHeader({ user }) {
    return (
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 flex items-center justify-between sticky top-0 z-10">
            <div className="flex-1 max-w-xl">
                <div className="relative group flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-slate-400 text-xl pointer-events-none">search</span>
                    <input className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm transition-all placeholder-slate-400" placeholder="Search accounts, logs, or signals..." type="text" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-500 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>
                <button className="p-2 text-slate-500 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">help</span>
                </button>
                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>
                <div className="flex items-center gap-2 text-emerald-custom font-semibold text-sm">
                    <span className="w-2 h-2 bg-emerald-custom rounded-full animate-pulse"></span>
                    Live Market Feed
                </div>
            </div>
        </header>
    );
}
