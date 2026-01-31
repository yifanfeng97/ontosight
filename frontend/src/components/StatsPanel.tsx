import { Card } from "@/components/ui/card";

interface StatsPanelProps {
  stats: Record<string, any>;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats || Object.keys(stats).length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Statistics</h3>
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">
                {typeof value === "number" ? value.toLocaleString() : value}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {key}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

