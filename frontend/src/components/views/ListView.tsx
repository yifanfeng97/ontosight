import { memo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useVisualization } from "@/hooks/useVisualization";

interface ListViewProps {
  data: any;
  meta: any;
}

const ListView = memo(function ListView({ data }: ListViewProps) {
  const { selectedNodes, selectNode } = useVisualization();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!data.items || data.items.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p>No items to display</p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {data.items.map((item: any) => (
            <ListItemRow
              key={item.id}
              item={item}
              isSelected={selectedNodes.has(item.id)}
              isExpanded={expandedId === item.id}
              onSelect={() => selectNode(item.id)}
              onToggleExpand={() => toggleExpand(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

interface ListItemRowProps {
  item: any;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}

function ListItemRow({
  item,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
}: ListItemRowProps) {
  const label = item.data?.label || item.id;
  const hasData = item.data && Object.keys(item.data).length > 0;

  return (
    <div className="border-b border-border/50">
      {/* List Item Header */}
      <div
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
          isSelected
            ? "bg-primary/10 hover:bg-primary/15"
            : "hover:bg-muted/50"
        }`}
        onClick={onSelect}
      >
        {/* Expand Toggle */}
        {hasData && (
          <button
            className="flex-shrink-0 p-0.5 hover:bg-muted/50 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            {isExpanded ? (
              <ChevronDown size={16} className="text-muted-foreground" />
            ) : (
              <ChevronRight size={16} className="text-muted-foreground" />
            )}
          </button>
        )}
        {!hasData && <div className="w-5" />}

        {/* Item Label */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{label}</p>
          <p className="text-xs text-muted-foreground truncate">{item.id}</p>
        </div>

        {/* Selection Indicator */}
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary opacity-0 transition-opacity" />
      </div>

      {/* Expanded Details Table */}
      {isExpanded && hasData && (
        <div className="px-3 py-2 bg-muted/20 border-t border-border/30">
          <DataTable data={item.data} />
        </div>
      )}
    </div>
  );
}

interface DataTableProps {
  data: Record<string, any>;
}

function DataTable({ data }: DataTableProps) {
  return (
    <div className="space-y-1">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex items-start gap-2 text-xs">
          <span className="font-mono font-semibold text-muted-foreground min-w-32 flex-shrink-0">
            {key}:
          </span>
          <span className="text-foreground break-words flex-1">
            {formatValue(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export default ListView;
