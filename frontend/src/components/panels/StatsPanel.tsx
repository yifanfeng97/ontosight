interface StatsPanelProps {
  stats: Record<string, any>;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats || Object.keys(stats).length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-10 p-4">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="flex flex-col group">
          <div className="relative">
            <span className="text-4xl font-black text-slate-800 tracking-tighter group-hover:text-indigo-600 transition-colors duration-500">
              {typeof value === "number" 
                ? (Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1)) 
                : value
              }
            </span>
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500/20 rounded-full scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
          </div>
          <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em] mt-3 font-black group-hover:text-slate-500 transition-colors duration-500">
            {key}
          </span>
        </div>
      ))}
    </div>
  );
}
