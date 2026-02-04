interface StatsPanelProps {
  stats: Record<string, any>;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats || Object.keys(stats).length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <span className="text-4xl font-bold text-foreground tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
            {key}
          </span>
        </div>
      ))}
    </div>
  );
}
